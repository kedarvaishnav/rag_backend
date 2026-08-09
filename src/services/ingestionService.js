import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import chunkText from "./chunkingService.js";
import generateEmbeddings from "./embeddingService.js";
import { storeChunks } from "./vectorService.js";

const processDocument = async (filePath, documentId) => {
    const dataBuffer = await fs.readFile(filePath);

    const parser = new PDFParse({
        data: dataBuffer
    });

    const result = await parser.getText();

    await parser.destroy();

    const chunks = chunkText(result.text, 1000, 200);

    const embeddedChunks = await generateEmbeddings(chunks);

    await storeChunks(embeddedChunks, documentId);

    return embeddedChunks;
};

export default processDocument;