<<<<<<< HEAD
const OpenAI = require("openai");

class AIAgent {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || "";

        if (this.apiKey) {
            this.client = new OpenAI({
                apiKey: this.apiKey,
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": "http://localhost:3001",
                    "X-Title": "WhatsApp AI Agent V3.1 Local",
                }
            });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("-----------------------------------------");
        console.log("AIAgent Initialized - VERSION 3.1 (ROLE CLARITY)");
        console.log("-----------------------------------------");
    }

    updateInstruction(instruction) {
        this.systemInstruction = instruction;
        console.log("AI Instruction Updated:", instruction);
    }

    async generateResponse(userMessage) {
        if (!this.apiKey) {
            this.apiKey = process.env.OPENROUTER_API_KEY || "";
        }

        if (!this.apiKey) {
            return "Erro: OPENROUTER_API_KEY não encontrada.";
        }

        if (!this.client && this.apiKey) {
            this.client = new OpenAI({
                apiKey: this.apiKey,
                baseURL: "https://openrouter.ai/api/v1"
            });
        }

        // Reforço de papel para evitar confusão (V3.1)
        const refinedSystemPrompt = `CONTEXTO: Você é um ASSISTENTE VIRTUAL. Você está falando com um CLIENTE externo via WhatsApp.
DIRETRIZES: Nunca se comporte como se o cliente fosse seu colega de trabalho. Seja prestativo, mas mantenha a fronteira de que você é a IA da empresa e ele é o cliente.

INSTRUÇÕES DO ADMINISTRADOR:
${this.systemInstruction}`;

        const models = [
            "openrouter/free",
            "liquid/lfm-2.5-1.2b-instruct:free",
            "stepfun/step-3.5-flash:free",
            "qwen/qwen3-next-80b-a3b-instruct:free",
            "upstage/solar-pro-3:free"
        ];

        let lastErrorMessage = "";

        for (const model of models) {
            try {
                console.log(`[V3.1] Tentando modelo com clareza de papel: ${model}`);
                const completion = await this.client.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: refinedSystemPrompt },
                        { role: "user", content: userMessage },
                    ],
                    max_tokens: 1000,
                });

                if (completion.choices && completion.choices[0].message.content) {
                    console.log(`[V3.1] Sucesso com: ${model}`);
                    return completion.choices[0].message.content;
                }
            } catch (error) {
                console.error(`[V3.1] Falha no modelo ${model}:`, error.message);
                lastErrorMessage = error.message;
            }
        }

        return `Erro Local V3.1: Todos os modelos disponíveis falharam.`;
    }
}

module.exports = { AIAgent };
=======
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
>>>>>>> cbea6a41fcafc511224a3d8160e3f51b511bc03a
