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
const { getUserConfig, updateUserConfig } = require('./db');

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
    status: 'disconnected',
    qr: null,
    humanInteractions: new Map()
  };

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
    if (msg.fromMe || msg.from === 'status@broadcast') return;

    const chat = await msg.getChat();
    const chatId = chat.id._serialized;
    const lastHumanTime = session.humanInteractions.get(chatId) || 0;

    // If human acted recently, don't reply
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

  client.initialize().catch(err => console.error(`Failed to initialize client for ${userId}:`, err));

  sessions.set(userId, session);
  return session;
}

// Socket connection
io.on('connection', async (socket) => {
  console.log('New socket connected:', socket.id);

  // Join a room specific to the user
  socket.on('join', async (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room ${userId}`);

    const session = await getOrCreateSession(userId, io);

    // Send current state
    socket.emit('status', session.status);
    if (session.qr) socket.emit('qr', session.qr);
    socket.emit('config', { systemInstruction: session.aiAgent.systemInstruction });
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
  });

  socket.on('logout_whatsapp', async (userId) => {
    if (!userId) return;
    const session = sessions.get(userId);
    if (session && session.client) {
      try {
        await session.client.logout();
        session.status = 'disconnected';
        session.qr = null;
        io.to(userId).emit('status', 'disconnected');
      } catch (err) {
        console.error(`Logout error for ${userId}:`, err);
      }
    }
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
