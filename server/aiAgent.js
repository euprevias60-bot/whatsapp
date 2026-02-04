const OpenAI = require("openai");

const API_KEY = process.env.OPENROUTER_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.client = new OpenAI({
                apiKey: API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": "https://railway.app",
                    "X-Title": "WhatsApp AI Agent V2.5",
                }
            });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("-----------------------------------------");
        console.log("AIAgent Initialized - VERSION 2.5 (FORCED)");
        console.log("-----------------------------------------");
    }

    updateInstruction(instruction) {
        this.systemInstruction = instruction;
        console.log("AI Instruction Updated:", instruction);
    }

    async generateResponse(userMessage) {
        if (!API_KEY) {
            return "Erro: OPENROUTER_API_KEY não configurada no Railway.";
        }

        // Lista agressiva de modelos (se um falhar, o próximo resolve)
        const models = [
            "deepseek/deepseek-r1:free",
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "mistralai/mistral-7b-instruct:free",
            "openchat/openchat-7b:free"
        ];

        let lastErrorMessage = "";

        for (const model of models) {
            try {
                console.log(`[V2.5] Trying model: ${model}`);
                const completion = await this.client.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: this.systemInstruction },
                        { role: "user", content: userMessage },
                    ],
                    max_tokens: 1000,
                });

                if (completion.choices && completion.choices[0].message.content) {
                    console.log(`[V2.5] Success with: ${model}`);
                    return completion.choices[0].message.content;
                }
            } catch (error) {
                console.error(`[V2.5] Failed ${model}:`, error.message);
                lastErrorMessage = error.message;
                // NÃO RETORNA ERRO AQUI. CONTINUA O LOOP.
            }
        }

        return `Erro Total V2.5: Nenhum modelo do OpenRouter respondeu. Último erro: ${lastErrorMessage}`;
    }
}

module.exports = { AIAgent };
