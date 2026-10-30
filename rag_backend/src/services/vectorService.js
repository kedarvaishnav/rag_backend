import { QdrantClient } from "@qdrant/js-client-rest";
import getPointId from "./pointId.js";
import { env } from "../config/env.js";

const qdrant = new QdrantClient({
    url: env.QDRANT_URL,
    checkCompatibility: false
});

const COLLECTION_NAME = env.QDRANT_COLLECTION;

const documentIdFilter = (documentId) => ({
    must: [
        {
            key: "documentId",
            match: {
                value: documentId
            }
        }
    ]
});

const initializeCollection = async () => {
    const exists = await qdrant.collectionExists(COLLECTION_NAME);

    console.log("Collection exists:", exists);

    if (!exists.exists) {
        await qdrant.createCollection(COLLECTION_NAME, {
            vectors: {
                size: 768,
                distance: "Cosine"
            }
        });

        console.log("Qdrant collection created");
    } else {
        console.log("Qdrant collection already exists");
    }
};

const storeChunks = async (embeddedChunks, documentId) => {

    const points = embeddedChunks.map((chunk, index) => ({
        id: getPointId(documentId, index),

        vector: chunk.vector,

        payload: {
            text: chunk.text,
            documentId: documentId,
            chunkIndex: index
        }
    }));

    await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points: points
    });

    await qdrant.delete(COLLECTION_NAME, {
        wait: true,
        filter: {
            must: [
                ...documentIdFilter(documentId).must,
                {
                    key: "chunkIndex",
                    range: {
                        gte: embeddedChunks.length
                    }
                }
            ]
        }
    });

    console.log(`${points.length} points stored in Qdrant`);
};

const getDocumentChunkCount = async (documentId) => {
    const result = await qdrant.count(COLLECTION_NAME, {
        filter: documentIdFilter(documentId),
        exact: true
    });

    return result.count;
};

export {
    initializeCollection,
    getDocumentChunkCount,
    storeChunks
};
