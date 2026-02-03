const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            // V1.6 - Usando 'gemini-pro' que tem maior compatibilidade global
            // e removendo a trava de apiVersion para o SDK decidir a melhor
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized with Gemini Pro - V1.6 (Compatibility Mode)");
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

            // Tenta um fallback para o flash se o pro falhar por algum motivo (ou vice-versa)
            if (error.message.includes("404")) {
                return "Erro 404: O modelo de IA não foi encontrado nesta região do servidor Railway. Tente trocar a região do seu projeto no Railway para 'US-East' ou use outra API Key.";
            }

            return `Erro Gemini: ${error.message || "Erro desconhecido"}`;
        }
    }
}

module.exports = { AIAgent };
