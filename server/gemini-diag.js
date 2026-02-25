require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models for key:", apiKey.substring(0, 8) + "...");
        // The SDK doesn't have a direct listModels but we can try to use the base API via fetch or just guess
        // Actually, let's try a simple test with a different model name
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (error) {
        console.error("Failed with gemini-1.5-flash:", error.message);

        try {
            console.log("Trying gemini-pro...");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello");
            console.log("Success with gemini-pro:", result.response.text());
        } catch (error2) {
            console.error("Failed with gemini-pro:", error2.message);
        }

        try {
            console.log("Trying gemini-1.0-pro...");
            const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            const result = await model.generateContent("Hello");
            console.log("Success with gemini-1.0-pro:", result.response.text());
        } catch (error3) {
            console.error("Failed with gemini-1.0-pro:", error3.message);
        }
    }
}

listModels();
