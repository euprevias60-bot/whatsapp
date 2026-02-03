const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.genAI = new GoogleGenerativeAI(API_KEY);
            // V2.1 - Usando os nomes mais explícitos possíveis
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }, { apiVersion: 'v1' });

            // Diagnóstico de conexão
            console.log("AIAgent Base Initialized - V2.1 (Absolute Sweep Mode)");
            console.log("API Key found:", API_KEY.startsWith("AIza") ? "Yes (Valid Start)" : "Invalid/Missing");
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
            // Tentativa Principal
            const prompt = `Instrução de Sistema: ${this.systemInstruction}\n\nUsuário: ${userMessage}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Error generating Gemini response (Attempt 1):", error.message);

            // Fallback 1: gemini-1.5-flash (padrão sem o -latest)
            try {
                console.log("Fallback 1: Trying gemini-1.5-flash...");
                const m2 = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
                const result = await m2.generateContent(`Instrução: ${this.systemInstruction}\n\nMensagem: ${userMessage}`);
                const response = await result.response;
                return response.text();
            } catch (err2) {
                console.error("Fallback 1 failed:", err2.message);

                // Fallback 2: gemini-pro (modelo clássico)
                try {
                    console.log("Fallback 2: Trying gemini-pro...");
                    const m3 = this.genAI.getGenerativeModel({ model: "gemini-pro" });
                    const result = await m3.generateContent(`Instrução: ${this.systemInstruction}\n\nMensagem: ${userMessage}`);
                    const response = await result.response;
                    return response.text();
                } catch (err3) {
                    console.error("Fallback 2 failed:", err3.message);
                    return `Erro Gemini V2.1: Todos os modelos falharam. Detalhe do erro principal: ${error.message}`;
                }
            }
        }
    }
}

module.exports = { AIAgent };
