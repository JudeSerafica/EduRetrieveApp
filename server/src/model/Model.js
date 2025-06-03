const geminiModule = require("@google/generative-ai");

const GoogleGenerativeAI = geminiModule.GoogleGenerativeAI;

// Ensure dotenv is loaded in your main server file (src/index.js)
// process.env.REACT_APP_GEMINI_API_KEY is usually for frontend; for server,
// prefer just GEMINI_API_KEY, but your current setup should still work if defined.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateContent = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return responseText;
    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        throw new Error("Failed to generate content from AI.");
    }
}

module.exports = { generateContent };