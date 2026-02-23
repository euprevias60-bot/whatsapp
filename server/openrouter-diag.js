require('dotenv').config();
const OpenAI = require('openai');

async function testOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("Checking API Key:", apiKey ? "Present (Ends with " + apiKey.slice(-4) + ")" : "Missing");

    if (!apiKey) return;

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1"
    });

    try {
        console.log("\n--- Testing Model List via Fetch ---");
        // Usando fetch nativo (Node 18+) para evitar dependências extras
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        const data = await response.json();

        if (data.data) {
            const freeModels = data.data
                .filter(m => m.id.includes(':free') || m.id.includes('free'))
                .map(m => m.id);

            console.log("Available FREE models (Total: " + freeModels.length + "):");
            console.log(JSON.stringify(freeModels.slice(0, 15), null, 2));

            if (freeModels.length === 0) {
                console.log("Warning: No FREE models found for this key.");
            }
        }

        console.log("\n--- Testing Single Prompt (Gemini Flash) ---");
        const completion = await client.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [{ role: "user", content: "Say hello" }],
        });

        console.log("Prompt Result:", completion.choices[0].message.content);
    } catch (error) {
        console.error("\nDiagnostic Error!");
        console.error("Status:", error.status);
        console.error("Message:", error.message);
        if (error.error) {
            console.error("Error Detail:", JSON.stringify(error.error, null, 2));
        }
    }
}

testOpenRouter();
