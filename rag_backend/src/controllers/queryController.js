import retrieveChunks from "../services/retrievalService.js";
import generateAnswer from "../services/generationService.js";
import rewriteQuestion from "../services/queryRewriteService.js";
import { z } from "zod";

const querySchema = z.object({
    question: z.string().min(1).max(1000),
    documentId: z.string().regex(/^[0-9a-fA-F]{64}$/),
    history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1500)
    })).max(6).optional().default([])
});

const queryDocument = async (req, res, next) => {
    try {
        const parsed = querySchema.safeParse(req.body ?? {});

        if (!parsed.success) {
            return res.status(400).json({
                message: "Question and a valid document ID are required"
            });
        }

        const { question, documentId, history } = parsed.data;
        const retrievalQuestion = await rewriteQuestion(question, history);

        const results = await retrieveChunks(retrievalQuestion, documentId);

        const answer = await generateAnswer(question, results, history);

        console.log(`Query completed for document ${documentId}; sources: ${results.length}`);

        res.status(200).json({
            question,
            answer,
            sources : results
        });

    } catch (error) {
        next(error);
    }
};

export default queryDocument;
