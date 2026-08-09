import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY
});

const generateEmbeddings = async (chunks) => {
    const contents = chunks.map((chunk) => ({
        parts: [{ text: chunk }]
    }));

    const response = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents,
         config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings.map((embedding, index) => ({
        text: chunks[index],
        vector: embedding.values
    }));
};

export default generateEmbeddings;