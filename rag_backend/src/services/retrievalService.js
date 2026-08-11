import { QdrantClient } from "@qdrant/js-client-rest";
import generateEmbeddings from "./embeddingService.js";

const qdrant = new QdrantClient({
    url: "http://127.0.0.1:6333",
    checkCompatibility: false
});

const COLLECTION_NAME = "documents";

const retrieveChunks = async (query) => {

    const queryVectors = await generateEmbeddings([query]);

    const queryVector = queryVectors[0].vector;

    console.log("queryVector is array:", Array.isArray(queryVector));
    console.log("queryVector length:", queryVector.length);
    console.log("first 5 values:", queryVector.slice(0, 5));

    const results = await qdrant.query(COLLECTION_NAME, {
        query: queryVector,
        limit: 5,
        with_payload: true
    });

    console.log("Qdrant results:", results);

    return results.points;
};

export default retrieveChunks;