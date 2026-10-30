import { QdrantClient } from "@qdrant/js-client-rest";
import generateEmbeddings from "./embeddingService.js";
import { env } from "../config/env.js";

const qdrant = new QdrantClient({
    url: env.QDRANT_URL,
    checkCompatibility: false
});

const COLLECTION_NAME = env.QDRANT_COLLECTION;

const retrieveChunks = async (query, documentId) => {

    const queryVectors = await generateEmbeddings([query]);

    const queryVector = queryVectors[0].vector;

    const results = await qdrant.query(COLLECTION_NAME, {
        query: queryVector,
        limit: 5,
        filter: {
            must: [
                {
                    key: "documentId",
                    match: {
                        value: documentId
                    }
                }
            ]
        },
        with_payload: true
    });

    return results.points;
};

export default retrieveChunks;
