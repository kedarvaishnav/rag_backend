import processDocument from "../services/ingestionService.js";
import crypto from "crypto";

const uploadDocument = async (req, res, next) => {
    try {
        const documentId = crypto.randomUUID();

        const result = await processDocument(
            req.file.path,
            documentId
        );

        res.status(201).json({
            message: "Document processed successfully",
            documentId: documentId,
            filename: req.file.originalname,
            chunkCount: result.length
        });
    } 
    catch (error) {
        next(error);
    }
};

export default uploadDocument;