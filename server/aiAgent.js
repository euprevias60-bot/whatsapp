const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            // V1.7 - Forçando o modelo mais recente e garantindo v1 estável no SDK
            this.model = this.genAI.getGenerativeModel({
                model: "gemini-1.5-flash-latest"
            }, { apiVersion: "v1" });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized with Gemini v1.5 Flash-Latest (Forced V1) - V1.7");
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

            // Tratamento de erro detalhado para ajudar no diagnóstico
            if (error.message.includes("404")) {
                return "Erro 404: O Google não encontrou o modelo de IA. Verifique se o seu projeto no Railway está na região US-East (Ohio) ou se sua API Key é do tipo 'Free' no Google AI Studio.";
            }

            return `Erro Gemini: ${error.message || "Erro desconhecido"}`;
        }
    }
}

module.exports = { AIAgent };
