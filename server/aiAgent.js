const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            // V2.0 - Revertendo para o nativo com nomes de recurso completos
            // Tentaremos o Flash primeiro
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized - V2.0 (Native SDK / Full Resource Mode)");
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
            // No Gemini nativo, enviamos instrução + mensagem
            const prompt = `Instrução de Sistema: ${this.systemInstruction}\n\nUsuário: ${userMessage}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error generating Gemini response (V2.0):", error);

            // Fallback automático para o modelo 8b se o flash falhar
            if (error.message.includes("404") || error.message.includes("not found")) {
                try {
                    console.log("Attempting fallback to gemini-1.5-flash-8b...");
                    const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }, { apiVersion: 'v1' });
                    const prompt = `Instrução de Sistema: ${this.systemInstruction}\n\nUsuário: ${userMessage}`;
                    const result = await fallbackModel.generateContent(prompt);
                    const response = await result.response;
                    return response.text();
                } catch (fallbackError) {
                    return `Erro Gemini V2.0 (Inclusive Fallback): ${fallbackError.message}`;
                }
            }

            return `Erro Gemini V2.0: ${error.message || "Erro desconhecido"}`;
        }
    }
}

module.exports = { AIAgent };
