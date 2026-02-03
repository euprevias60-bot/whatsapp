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
    const config = db.users[userId] || {
        systemInstruction: "Você é um assistente virtual útil.",
        isSubscribed: false, // Default novo
        subscriptionExpiry: null
    };
    return config;
};

// Update User Config
const updateUserConfig = async (userId, config) => {
    const db = await getDB();
    db.users[userId] = { ...db.users[userId], ...config };
    await saveDB(db);
    return db.users[userId];
};

const checkSubscription = async (userId) => {
    const config = await getUserConfig(userId);
    return config.isSubscribed === true;
};

module.exports = { getUserConfig, updateUserConfig, checkSubscription };
