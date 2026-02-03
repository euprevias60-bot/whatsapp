const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
    }

    updateInstruction(instruction) {
        this.systemInstruction = instruction;
        console.log("AI Instruction Updated:", instruction);
    }

    async generateResponse(userMessage) {
        if (!API_KEY) {
            return "Erro: GEMINI_API_KEY não configurada no Railway.";
        }

        try {
            // No Gemini Free, enviamos a instrução de sistema junto com a mensagem
            const prompt = `Instrução de Sistema: ${this.systemInstruction}\n\nUsuário: ${userMessage}`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error generating Gemini response:", error);
            if (error.message.includes("API_KEY_INVALID")) {
                return "Erro: Sua GEMINI_API_KEY parece ser inválida. Verifique no Google AI Studio.";
            }
            return "Desculpe, tive um erro ao processar sua mensagem via Google Gemini.";
        }
    }
}

module.exports = { AIAgent };
