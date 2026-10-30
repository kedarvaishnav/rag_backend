import retrieveChunks from "../services/retrievalService.js";
import generateAnswer from "../services/generationService.js";
import { z } from "zod";

const querySchema = z.object({
    question: z.string().min(1).max(1000),
    documentId: z.string().regex(/^[0-9a-fA-F]{64}$/)
});

const queryDocument = async (req, res, next) => {
    try {
        const parsed = querySchema.safeParse(req.body ?? {});

        if (!parsed.success) {
            return res.status(400).json({
                message: "Question and a valid document ID are required"
            });
        }

        const { question, documentId } = parsed.data;

        const results = await retrieveChunks(question, documentId);

        const answer= await generateAnswer(question , results);

        console.log("Retrieved results:", results);

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
