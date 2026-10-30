import fs from "fs/promises";
import crypto from "crypto";
import { PDFParse } from "pdf-parse";
import chunkText from "./chunkingService.js";
import generateEmbeddings from "./embeddingService.js";
import { getDocumentChunkCount, storeChunks } from "./vectorService.js";

const processDocument = async (filePath) => {
    const dataBuffer = await fs.readFile(filePath);

    const documentId = crypto
        .createHash("sha256")
        .update(dataBuffer)
        .digest("hex");

    const existingChunkCount = await getDocumentChunkCount(documentId);

    console.log(existingChunkCount > 0
        ? `Document already exists: ${documentId}`
        : `New document detected: ${documentId}`);

    const parser = new PDFParse({
        data: dataBuffer
    });

    let result;

    try {
        result = await parser.getText();
    } finally {
        await parser.destroy();
    }

    const chunks = chunkText(result.text, 1000, 200);

    const embeddedChunks = await generateEmbeddings(chunks);

    await storeChunks(embeddedChunks, documentId);

    return {
        alreadyExists: existingChunkCount > 0,
        documentId,
        chunkCount: embeddedChunks.length
    };
};

export default processDocument;
