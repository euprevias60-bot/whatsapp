const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIAgent {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || "";
        this.genAI = null;
        this.model = null;

        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            // Default model (will be overridden by fallback list)
            this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        }

        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("-----------------------------------------");
        console.log("AIAgent Initialized - VERSION 4.4 (CONTEXT & HISTORY)");
        console.log("-----------------------------------------");
    }

    updateInstruction(instruction) {
        this.systemInstruction = instruction;
        console.log("AI Instruction Updated:", instruction);
    }

    async generateResponse(userMessage, incomingHistory = []) {
        if (!this.apiKey) {
            this.apiKey = process.env.GEMINI_API_KEY || "";
        }

        if (!this.apiKey) {
            return { text: "Erro: GEMINI_API_KEY não encontrada.", history: incomingHistory };
        }

        if (!this.genAI) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        }

        const refinedSystemPrompt = `CONTEXTO: Você é um ASSISTENTE VIRTUAL. Você está falando com um CLIENTE externo via WhatsApp.
DIRETRIZES: Nunca se comporte como se o cliente fosse seu colega de trabalho. Seja prestativo, mas mantenha a fronteira de que você é a IA da empresa e ele é o cliente.

INSTRUÇÕES ESPECÍFICAS DO ADMINISTRADOR:
${this.systemInstruction}`;

        const modelsToTry = [
            "gemini-flash-latest",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash",
            "gemini-pro"
        ];

        let lastError = "";

        // If history is empty, we must seed it with the system prompt context
        let currentHistory = incomingHistory.length > 0 ? [...incomingHistory] : [
            {
                role: "user",
                parts: [{ text: refinedSystemPrompt }],
            },
            {
                role: "model",
                parts: [{ text: "Entendido. Sou o assistente virtual e seguirei essas instruções rigorosamente." }],
            },
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`[V4.4] Tentando modelo: ${modelName} (Histórico: ${incomingHistory.length} msgs)`);
                const model = this.genAI.getGenerativeModel({ model: modelName });

                const chat = model.startChat({
                    history: currentHistory,
                });

                const result = await chat.sendMessage(userMessage);
                const response = await result.response;
                const text = response.text();

                if (text) {
                    console.log(`[V4.4] Sucesso com modelo: ${modelName}`);
                    // Retrieve updated history from the chat session
                    const updatedHistory = await chat.getHistory();
                    return { text, history: updatedHistory };
                }
            } catch (error) {
                console.error(`[V4.4] Falha no modelo ${modelName}:`, error.message);
                lastError = error.message;
            }
        }

        return {
            text: `Erro Gemini V4.4: Todos os modelos falharam. Último erro: ${lastError}`,
            history: incomingHistory
        };
    }
}

module.exports = { AIAgent };
