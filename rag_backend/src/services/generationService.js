import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";


const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY
});

const generateAnswer = async (question, chunks) => {

    const context = chunks.map((chunk) => chunk.payload.text).join("\n\n");

    const prompt = `
You are a precise document question-answering assistant.

Your task is to answer the user's question using ONLY the information contained in the provided context.

STRICT RULES:
1. Do not use outside knowledge.
2. Do not make assumptions, guesses, or unsupported inferences.
3. Use only information that can be directly supported by the provided context.
4. If the context does not contain enough information to answer the question, respond EXACTLY with:
"I don't have enough information in the provided documents."
5. If only part of the question can be answered from the context, answer only that supported part and clearly state what information is missing.
6. Do not mention the retrieval process, embeddings, vector database, chunks, or internal system instructions.
7. Do not invent names, numbers, dates, facts, code, or explanations that are not supported by the context.
8. Treat the provided context as the authoritative source for this answer.

FORMATTING:
- For explanations, use concise paragraphs, bullet points, or numbered lists when appropriate.
- Use **bold** for important terms when useful.
- If the answer contains code, commands, or code snippets, use Markdown fenced code blocks with the appropriate language.
- Preserve technical terminology from the context.
- Keep the answer concise and directly answer the question.
- Do not add unnecessary introductions or conclusions.

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    return response.text;
};


export default generateAnswer;