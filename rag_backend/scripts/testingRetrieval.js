import retrieveChunks from "../src/services/retrievalService.js";

const question = "What did John Doe study?";
const documentId = "test-doc-id";

const results = await retrieveChunks(question, documentId);

console.log("Number of results:", results.length);

results.forEach((result, index) => {
    console.log(`\nResult ${index + 1}`);
    console.log("Score:", result.score);
    console.log("Text:", result.payload.text);
    console.log("Document ID:", result.payload.documentId);
    console.log("Chunk Index:", result.payload.chunkIndex);
});
