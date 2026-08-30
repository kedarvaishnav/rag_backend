import processDocument from "../services/ingestionService.js";
import { getDocumentChunkCount } from "../services/vectorService.js";
import fs from "fs/promises";

const cleanupUploadedFile = async (filePath) => {
    if (!filePath) {
        return;
    }

    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error(`Failed to clean up uploaded file ${filePath}:`, error);
    }
};

const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "PDF file is required"
            });
        }

        const result = await processDocument(req.file.path);

        await cleanupUploadedFile(req.file.path);

        res.status(201).json({
            message: result.alreadyExists
                ? "Document already exists"
                : "Document processed successfully",
            alreadyExists: result.alreadyExists,
            documentId: result.documentId,
            filename: req.file.originalname,
            chunkCount: result.chunkCount
        });
    } 
    catch (error) {
        await cleanupUploadedFile(req.file?.path);
        next(error);
    }
};

const getDocument = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        if (!documentId) {
            return res.status(400).json({
                exists: false,
                message: "Document ID is required"
            });
        }

        const chunkCount = await getDocumentChunkCount(documentId);

        if (chunkCount === 0) {
            return res.status(404).json({
                exists: false,
                message: "Document not found"
            });
        }

        res.status(200).json({
            exists: true,
            documentId,
            chunkCount
        });
    } catch (error) {
        next(error);
    }
};

export {
    getDocument
};

export default uploadDocument;
