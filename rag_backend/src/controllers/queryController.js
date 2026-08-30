import retrieveChunks from "../services/retrievalService.js";
import generateAnswer from "../services/generationService.js";

const queryDocument = async (req, res, next) => {
    try {
        const { question, documentId } = req.body;

        if (!question || typeof question !== "string") {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        if (!documentId || typeof documentId !== "string") {
            return res.status(400).json({
                message: "Document ID is required"
            });
        }

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