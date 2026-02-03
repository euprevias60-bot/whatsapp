const fs = require('fs-extra');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeJsonSync(DB_FILE, {
        users: {
            // "default": { systemInstruction: "..." }
        }
    });
}

// Helper to get DB
const getDB = async () => {
    return await fs.readJson(DB_FILE);
};

// Helper to save DB
const saveDB = async (data) => {
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
};

// Get User Config
const getUserConfig = async (userId = 'default') => {
    const db = await getDB();
    if (!db.users[userId]) {
        // Inicializa novo usuário com data de criação
        db.users[userId] = {
            systemInstruction: "Você é um assistente virtual útil.",
            isSubscribed: false,
            subscriptionExpiry: null,
            createdAt: new Date().toISOString(),
            email: '' // Será preenchido no login
        };
        await saveDB(db);
    }
    return db.users[userId];
};

// Update User Config
const updateUserConfig = async (userId, newConfig) => {
    const db = await getDB();
    db.users[userId] = {
        ...(db.users[userId] || { createdAt: new Date().toISOString() }),
        ...newConfig
    };
    await saveDB(db);
    return db.users[userId];
};

const getAllUsers = async () => {
    const db = await getDB();
    return db.users;
};

const checkSubscription = async (userId) => {
    const config = await getUserConfig(userId);

    // Admin sempre tem acesso PRO
    if (config.email && config.email.toLowerCase() === 'mateusolivercrew@gmail.com') {
        return true;
    }

    if (!config.isSubscribed) return false;

    if (config.subscriptionExpiry) {
        const expiry = new Date(config.subscriptionExpiry);
        if (new Date() > expiry) {
            // Expirou
            await updateUserConfig(userId, { isSubscribed: false });
            return false;
        }
    }
    return true;
};

const addSupportMessage = async (userId, userEmail, message) => {
    const db = await getDB();
    if (!db.support) db.support = [];
    db.support.push({
        userId,
        userEmail,
        message,
        timestamp: new Date().toISOString(),
        read: false
    });
    await saveDB(db);
    return db.support;
};

const getSupportMessages = async () => {
    const db = await getDB();
    return db.support || [];
};

module.exports = {
    getUserConfig,
    updateUserConfig,
    getAllUsers,
    checkSubscription,
    addSupportMessage,
    getSupportMessages
};
