import { QdrantClient } from "@qdrant/js-client-rest";
import crypto from "crypto";

const qdrant = new QdrantClient({
    url:"http://localhost:6333",
    checkCompatibility: false
});

const COLLECTION_NAME = "documents";

const createCollection = async() => {
    await qdrant.createCollection(COLLECTION_NAME,{
        vectors:{
            size:768,
            distance:"Cosine"
        }
    });
    console.log("Collection created");
};

const initializeCollection = async () => {
    const exists = await qdrant.collectionExists(COLLECTION_NAME);

    if (!exists) {
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

const storeChunks = async (embeddedChunks , documentId)=>{

    const points = embeddedChunks.map((chunk , index)=>({
        id: crypto.randomUUID(),

        vector: chunk.vector,

        payload:{
            text: chunk.text,
            documentId: documentId,
            chunkIndex: index
        }
    }));

    await qdrant.upsert(COLLECTION_NAME,{
        wait:true,
        points:points
    });
};

export {initializeCollection , storeChunks};