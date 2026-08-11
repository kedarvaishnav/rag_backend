import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";


const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY
});

const generateAnswer = async (question , chunks) =>{
    
    const context = chunks.map((chunk)=> chunk.payload.text).join("\n\n");
    
        const prompt = `
You are a helpful question-answering assistant.

Answer the user's question using only the provided context.

If the answer cannot be found in the context, say:
"I don't have enough information in the provided documents."

Context:
${context}

Question:
${question}

Answer:
`;

const response = await ai.models.generateContent({
    model:"gemini-3.5-flash-lite",
    contents:prompt
});

    return response.text;
};


export default generateAnswer;