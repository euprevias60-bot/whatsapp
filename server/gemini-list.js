require('dotenv').config();

async function checkModelsDirectly() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log("Checking models directly via GET request...");

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            return;
        }

        console.log("Available Models:");
        if (data.models && data.models.length > 0) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("No models returned in the list. This usually means the API key is not valid for the Generative Language API or it's restricted.");
        }
    } catch (err) {
        console.error("Request failed:", err.message);
    }
}

checkModelsDirectly();
