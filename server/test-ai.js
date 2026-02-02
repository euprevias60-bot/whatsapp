const OpenAI = require("openai");

// OpenRouter API Key provided by user
const API_KEY = "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";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: API_KEY,
});

const models = [
    "google/gemini-1.5-flash",
    "google/gemini-flash-1.5",
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "google/gemini-2.0-flash-001",
    "mistralai/mistral-7b-instruct:free",
    "openai/gpt-3.5-turbo"
];

async function test() {
    console.log("Testing OpenRouter connection with multiple models...");

    for (const model of models) {
        console.log(`\n[Trying] ${model}...`);
        try {
            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    { role: "user", content: "Hello" }
                ],
            });
            console.log(`[SUCCESS] Model: ${model}`);
            console.log("Response:", completion.choices[0].message.content);
            return; // Exit on first success
        } catch (error) {
            console.error(`[FAILED] Model: ${model}`);
            if (error.error && error.error.message) {
                console.error("Reason:", error.error.message);
            } else {
                console.error("Error:", error.message || error);
            }
        }
    }
    console.log("\nAll models failed.");
}

test();
