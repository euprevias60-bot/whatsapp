const OpenAI = require("openai");

// Usando OpenRouter com DeepSeek R1 (Free)
const API_KEY = process.env.OPENROUTER_API_KEY || "";

class AIAgent {
    constructor() {
        if (API_KEY) {
            this.client = new OpenAI({
                apiKey: API_KEY,
                baseURL: "https://openrouter.ai/api/v1"
            });
        }
        this.systemInstruction = "Você é um assistente virtual útil.";
        console.log("AIAgent Initialized - V2.3 (OpenRouter + DeepSeek R1)");
    }

    updateInstruction(instruction) {
        this.systemInstruction = instruction;
        console.log("AI Instruction Updated:", instruction);
    }

    async generateResponse(userMessage) {
        if (!API_KEY) {
            return "Erro: OPENROUTER_API_KEY não configurada no Railway.";
        }

        try {
            const completion = await this.client.chat.completions.create({
                model: "deepseek/deepseek-r1:free",
                messages: [
                    { role: "system", content: this.systemInstruction },
                    { role: "user", content: userMessage },
                ],
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Error generating DeepSeek response:", error);
            return `Erro DeepSeek V2.3: ${error.message || "Erro desconhecido"}`;
        }
    }
}

module.exports = { AIAgent };
