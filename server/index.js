const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs-extra');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const { AIAgent } = require('./aiAgent');
const { getUserConfig, updateUserConfig, checkSubscription } = require('./db');
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configuração Mercado Pago (Você precisará colocar seu Access Token no arquivo .env)
const clientMP = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-4331530716884997-020309-8d2d0c7f343811f62bc142b3b61a8ca7-2627778833'
});

// Endpoint para criar o pagamento
app.post('/api/create-preference', async (req, res) => {
  try {
    const { userId, planName, price } = req.body;
    const preference = new Preference(clientMP);

    const result = await preference.create({
      body: {
        items: [
          {
            title: `Plano ${planName} - WhatsApp AI`,
            quantity: 1,
            unit_price: Number(price)
          }
        ],
        payer: {
          email: 'cliente@exemplo.com',
          first_name: 'Cliente',
          last_name: 'WhatsApp Bot'
        },
        notification_url: `${process.env.PUBLIC_URL || 'https://seu-site.railway.app'}/api/webhook/mercadopago`,
        external_reference: userId, // Importante para saber quem pagou
        back_urls: {
          success: `${process.env.PUBLIC_URL || 'http://localhost:5173'}/dashboard`,
        },
        auto_return: "approved",
      }
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error("Erro ao criar preferência Mercado Pago:");
    if (error.response) {
      console.error(JSON.stringify(error.response, null, 2));
    } else {
      console.error(error);
    }
    res.status(500).json({ error: "Erro ao gerar pagamento", details: error.message });
  }
});

// Webhook para receber a confirmação de pagamento
app.post('/api/webhook/mercadopago', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;

  if (topic === 'payment') {
    const paymentId = query.id || query['data.id'];
    console.log(`Recebido pagamento: ${paymentId}`);

    try {
      // Em produção, você deve usar o SDK para buscar os detalhes do pagamento
      // const payment = new Payment(clientMP).get({ id: paymentId });
      // if (payment.status === 'approved') {
      //    const userId = payment.external_reference;
      //    await updateUserConfig(userId, { isSubscribed: true });
      // }

      // Para testes rápidos, se recebermos o webhook, vamos ativar o usuário
      // baseado na query string ou external_reference se disponível
      const userId = query.userId || req.body.external_reference;
      if (userId) {
        console.log(`Ativando assinatura para usuário: ${userId}`);

        // Calcula 30 dias a partir de agora
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        await updateUserConfig(userId, {
          isSubscribed: true,
          subscriptionExpiry: expiryDate.toISOString()
        });

        io.to(userId).emit('config', {
          isSubscribed: true,
          subscriptionExpiry: expiryDate.toISOString()
        });
      }
    } catch (err) {
      console.error("Erro no webhook:", err);
    }
  }
  res.sendStatus(200);
});

// Multi-user session management
const sessions = new Map();

async function getOrCreateSession(userId, io) {
  if (sessions.has(userId)) return sessions.get(userId);

  console.log(`Creating new session for user: ${userId}`);
  const aiAgent = new AIAgent();

  // Load config from DB
  const config = await getUserConfig(userId);
  aiAgent.updateInstruction(config.systemInstruction);

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  const session = {
    client,
    aiAgent,
    status: 'loading',
    qr: null,
    paused: false,
    humanInteractions: new Map()
  };

  io.to(userId).emit('status', session.status);
  io.to(userId).emit('paused_status', session.paused);

  const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

  // WhatsApp Events for this specific user
  client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      if (!err) {
        session.qr = url;
        console.log(`QR Generated for user ${userId}`);
        io.to(userId).emit('qr', url);
      }
    });
  });

  client.on('ready', () => {
    session.status = 'connected';
    session.qr = null;
    console.log(`WhatsApp Client is ready for user ${userId}`);
    io.to(userId).emit('status', 'connected');
  });

  client.on('authenticated', () => {
    session.status = 'authenticated';
    io.to(userId).emit('status', 'authenticated');
  });

  client.on('auth_failure', () => {
    session.status = 'disconnected';
    io.to(userId).emit('status', 'auth_failure');
  });

  client.on('disconnected', () => {
    session.status = 'disconnected';
    io.to(userId).emit('status', 'disconnected');
  });

  client.on('message_create', async (msg) => {
    if (msg.fromMe) {
      const chat = await msg.getChat();
      session.humanInteractions.set(chat.id._serialized, Date.now());
    }
  });

  client.on('message', async msg => {
    // Condition 1: Paused by user
    if (session.paused) return;

    // Condition 2: Basic filters
    if (msg.fromMe || msg.from === 'status@broadcast') return;

    const chat = await msg.getChat();
    const chatId = chat.id._serialized;
    const lastHumanTime = session.humanInteractions.get(chatId) || 0;

    // Condition 3: Human takeover (5 min)
    if (Date.now() - lastHumanTime < INACTIVITY_TIMEOUT) return;

    try {
      await chat.sendStateTyping();
      const response = await session.aiAgent.generateResponse(msg.body);
      await chat.sendMessage(response);
      console.log(`Sent reply for user ${userId} to ${msg.from}`);
    } catch (err) {
      console.error(`Error processing message for user ${userId}:`, err);
    }
  });

  // We only initialize if specific start command is given or if we want auto-start
  // Let's keep it auto-start on session creation for now, but provide controls to stop it.
  client.initialize().catch(err => console.error(`Failed to initialize client for ${userId}:`, err));

  sessions.set(userId, session);
  return session;
}

// Socket connection
io.on('connection', async (socket) => {
  console.log('New socket connected:', socket.id);

  // Join a room specific to the user
  socket.on('join', async (userId, userEmail) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);

    // Atualiza email se fornecido
    if (userEmail) {
      await updateUserConfig(userId, { email: userEmail });
    }

    const userConfig = await getUserConfig(userId);
    const subscribed = await checkSubscription(userId);

    console.log(`User ${userId} subscription status: ${subscribed}`);

    if (subscribed) {
      const session = await getOrCreateSession(userId, io);
      socket.emit('status', session.status);
      socket.emit('paused_status', session.paused);
      if (session.qr) socket.emit('qr', session.qr);
      socket.emit('config', {
        systemInstruction: session.aiAgent.systemInstruction,
        isSubscribed: true
      });
    } else {
      socket.emit('status', 'disconnected');
      socket.emit('config', {
        systemInstruction: userConfig.systemInstruction,
        isSubscribed: false
      });
    }
  });

  socket.on('requestAllUsers', async (adminId) => {
    const userConfig = await getUserConfig(adminId);
    if (userConfig.email === 'Mateusolivercrew@gmail.com') {
      const users = await getAllUsers();
      socket.emit('allUsersList', users);
    }
  });

  socket.on('updateConfig', async (data) => {
    const { userId, systemInstruction } = data;
    if (!userId || !systemInstruction) return;

    console.log(`Updating config for user ${userId}`);
    const session = await getOrCreateSession(userId, io);
    session.aiAgent.updateInstruction(systemInstruction);
    await updateUserConfig(userId, { systemInstruction });
  });

  socket.on('requestStatus', async (userId) => {
    if (!userId) return;
    const session = await getOrCreateSession(userId, io);
    socket.emit('status', session.status);
    socket.emit('paused_status', session.paused);
  });

  socket.on('pause_bot', async (userId) => {
    if (!userId) return;
    const session = sessions.get(userId);
    if (session) {
      session.paused = !session.paused; // Toggle pause
      io.to(userId).emit('paused_status', session.paused);
      console.log(`User ${userId} bot paused state: ${session.paused}`);
    }
  });

  socket.on('stop_bot', async (userId) => {
    if (!userId) return;
    const session = sessions.get(userId);
    if (session && session.client) {
      try {
        await session.client.logout(); // Logout from WA
        await session.client.destroy(); // Properly kill the browser
        sessions.delete(userId); // Remove session
        io.to(userId).emit('status', 'disconnected');
        console.log(`User ${userId} bot stopped and session deleted.`);
      } catch (err) {
        console.error(`Stop bot error for ${userId}:`, err);
      }
    }
  });

  socket.on('start_bot', async (userId) => {
    if (!userId) return;
    // This will trigger creation and initialization
    await getOrCreateSession(userId, io);
  });
});



// Production logic
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get(/(.*)/, (req, res) => {
    const filePath = path.join(__dirname, '../client/dist', 'index.html');
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Frontend build not found.');
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send('WhatsApp AI Agent Multi-User Server is running');
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
