require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            // V1.8 - Voltando ao básico e adicionando diagnóstico
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Diagnóstico silencioso para ver modelos nos logs do Railway
            this.listAvailableModels();
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized - V1.8 (Standard Mode)");
    }

    async listAvailableModels() {
        try {
            // Este log aparecerá nos logs do Railway quando ligar o servidor
            console.log("--- Diagnóstico Gemini (Modelos Disponíveis) ---");
            // No SDK atual, listModels pode ser restrito ou diferente, 
            // vamos apenas tentar um log de confirmação da chave
            console.log("API Key configurada (primeiros 5):", API_KEY.substring(0, 5) + "...");
        } catch (e) { }
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

            if (error.message.includes("404")) {
                return `Erro 404 (V1.8): O Google não encontrou o modelo gemini-1.5-flash. Verifique sua região no Railway ou se a chave é válida para esse modelo. Detalhe: ${error.message}`;
            }

            return `Erro Gemini (V1.8): ${error.message || "Erro desconhecido"}`;
        }
    }
}

module.exports = { AIAgent };
