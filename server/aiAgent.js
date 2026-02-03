const OpenAI = require("openai");

// A chave será lida do ambiente (Railway) ou usará uma temporária se você quiser
const API_KEY = process.env.GEMINI_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            // V1.9 - Usando o Protocolo OpenAI para falar com o Gemini
            // Isso costuma ser mais estável contra erros de 404 do SDK nativo
            this.client = new OpenAI({
                apiKey: API_KEY,
                baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
            });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized with Gemini (OpenAI Protocol) - V1.9");
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
            const completion = await this.client.chat.completions.create({
                model: "gemini-1.5-flash",
                messages: [
                    { role: "system", content: this.systemInstruction },
                    { role: "user", content: userMessage },
                ],
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Error generating Gemini response (OpenAI Protocol):", error);

            // Retorna o erro detalhado para o WhatsApp
            return `Erro Gemini V1.9: ${error.message || "Erro desconhecido"}`;
        }
    }
}

module.exports = { AIAgent };
