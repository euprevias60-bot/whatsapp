const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            // V2.2 - Removendo TODAS as travas de versão, deixando o SDK decidir
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized - V2.2 (SDK Default Mode)");
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
            // Tentativa 1: gemini-1.5-flash (padrão do SDK)
            const prompt = `Instrução de Sistema: ${this.systemInstruction}\n\nUsuário: ${userMessage}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Error with gemini-1.5-flash:", error.message);

            // Fallback: gemini-pro (sem versão forçada)
            try {
                console.log("Fallback: Trying gemini-pro (SDK default)...");
                const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
                const prompt = `Instrução de Sistema: ${this.systemInstruction}\n\nUsuário: ${userMessage}`;
                const result = await fallbackModel.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (err2) {
                console.error("Fallback gemini-pro failed:", err2.message);
                return `Erro Gemini V2.2: Ambos os modelos falharam. Sua chave pode não ter acesso ao Gemini. Erro: ${error.message}`;
            }
        }
    }
}

module.exports = { AIAgent };
