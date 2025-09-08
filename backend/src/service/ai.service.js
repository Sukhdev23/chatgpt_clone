const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function genarateContent(content) {
  try {

    // Generate content
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: content
    });

    // Access the text output properly
    return result.text;

  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

async function generateVector(content) {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768
    }
  });
  return result.embeddings[0].values;
}

module.exports = {
  genarateContent,
  generateVector
};
