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
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = 3001;

const { AIAgent } = require('./aiAgent');
const { getUserConfig, updateUserConfig } = require('./db');

// Initialize AI Agent
const aiAgent = new AIAgent();

// WhatsApp Client Setup
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let currentStatus = 'disconnected';


// Socket connection
io.on('connection', async (socket) => {
  console.log('New client connected');

  // Send current status immediately to new client
  socket.emit('status', currentStatus);

  // Load default config (Single user mode for now, or could pass ID via query)
  // For this local agent, we can default to a 'main_user'
  const config = await getUserConfig('main_user');
  if (config && config.systemInstruction) {
    aiAgent.updateInstruction(config.systemInstruction);
  }

  // Send current config
  socket.emit('config', { systemInstruction: aiAgent.systemInstruction });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('updateConfig', async (data) => {
    if (data.systemInstruction) {
      aiAgent.updateInstruction(data.systemInstruction);
      // Save to DB
      await updateUserConfig('main_user', { systemInstruction: data.systemInstruction });
      console.log('Config saved to database');
    }
  });

  socket.on('requestStatus', () => {
    socket.emit('status', currentStatus);
  });
});


// WhatsApp Events
client.on('qr', (qr) => {
  console.log('QR Code received');
  qrcode.toDataURL(qr, (err, url) => {
    if (!err) {
      io.emit('qr', url);
    }
  });
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
  currentStatus = 'connected';
  io.emit('status', 'connected');
});

client.on('authenticated', () => {
  console.log('Authenticated');
  currentStatus = 'authenticated';
  io.emit('status', 'authenticated');
});

client.on('auth_failure', () => {
  console.log('Auth failure');
  io.emit('status', 'auth_failure');
});

client.on('disconnected', () => {
  console.log('Tips: WhatsApp disconnected');
  currentStatus = 'disconnected';
  io.emit('status', 'disconnected');
});

const humanInteractions = new Map();
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Listen to ALL messages (including ours) to detect human intervention
client.on('message_create', async (msg) => {
  if (msg.fromMe) {
    const chat = await msg.getChat();
    console.log(`Human intervened in chat: ${chat.id._serialized}. Pausing AI.`);
    humanInteractions.set(chat.id._serialized, Date.now());
  }
});

client.on('message', async msg => {
  if (msg.fromMe) return;

  // Filter out status/broadcast messages if needed
  if (msg.from === 'status@broadcast') return;

  const chat = await msg.getChat();
  const chatId = chat.id._serialized;

  // Check for human takeover
  const lastHumanTime = humanInteractions.get(chatId) || 0;
  if (Date.now() - lastHumanTime < INACTIVITY_TIMEOUT) {
    console.log(`AI Paused for ${chatId} due to recent human activity.`);
    return;
  }

  console.log(`Received message from ${msg.from}: ${msg.body}`);

  // Generate AI Response
  try {
    await chat.sendStateTyping(); // Simulate typing
    const response = await aiAgent.generateResponse(msg.body);
    await chat.sendMessage(response);
    console.log(`Sent reply to ${msg.from}`);
  } catch (err) {
    console.error('Failed to send message:', err);
  }
});


// Initialize Client
client.initialize();

// Routes
// process.env.NODE_ENV will be set to 'production' on the cloud
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  const path = require('path');
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('WhatsApp AI Agent Server is running (Development Mode)');
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
