const OpenAI = require("openai");

// OpenRouter API Key provided by user
const API_KEY = "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";

class AIAgent {
    constructor() {
        this.openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: API_KEY,
        });
        this.systemInstruction = "Você é um assistente virtual útil.";
        // Chat history could be managed here or per user session in a real DB
        // For simple demo, we unfortunately can't keep context per user easily without a DB
        // So we will just send the system instruction + user message for now, or simple in-memory map
    }

    updateInstruction(instruction) {
        this.systemInstruction = instruction;
        console.log("AI Instruction Updated:", instruction);
    }

    async generateResponse(userMessage) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "google/gemini-2.0-flash-001", // Confirmed working model
                messages: [
                    { role: "system", content: this.systemInstruction },
                    { role: "user", content: userMessage }
                ],
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Error generating AI response:", error);
            return "Desculpe, tive um erro ao processar sua mensagem via OpenRouter.";
        }
    }
}

module.exports = { AIAgent };
