const OpenAI = require("openai");

const API_KEY = process.env.OPENROUTER_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.client = new OpenAI({
                apiKey: API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": "https://railway.app", // Opcional, mas recomendado pelo OpenRouter
                    "X-Title": "WhatsApp AI Agent",
                }
            });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized - V2.4 (OpenRouter Multi-Model Fallback)");
    }

    updateInstruction(instruction) {
        this.systemInstruction = instruction;
        console.log("AI Instruction Updated:", instruction);
    }

    async generateResponse(userMessage) {
        if (!API_KEY) {
            return "Erro: OPENROUTER_API_KEY não configurada no Railway.";
        }

        // Lista de modelos para tentar (em ordem de preferência)
        const models = [
            "deepseek/deepseek-r1:free",
            "deepseek/deepseek-chat",
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3.1-8b-instruct:free"
        ];

        let lastError = null;

        for (const model of models) {
            try {
                console.log(`Attempting response with model: ${model}...`);
                const completion = await this.client.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: this.systemInstruction },
                        { role: "user", content: userMessage },
                    ],
                    max_tokens: 1000,
                });

                if (completion.choices && completion.choices[0].message.content) {
                    console.log(`Success with model: ${model}`);
                    return completion.choices[0].message.content;
                }
            } catch (error) {
                console.error(`Error with model ${model}:`, error.message);
                lastError = error;
                // Continua para o próximo modelo se der erro 404 ou outros
                continue;
            }
        }

        return `Erro OpenRouter V2.4: Todos os modelos falharam. Último erro: ${lastError ? lastError.message : "Desconhecido"}`;
    }
}

module.exports = { AIAgent };
