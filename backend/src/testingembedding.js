// // import "dotenv/config";
import generateEmbeddings from "./services/embeddingService.js";

// const text = "Python is a programming language.";

// const vector = await generateEmbedding(text);

// console.log("Vector length:", vector.length);
// console.log("First 10 values:", vector.slice(0, 10));

// const chunks = [
//     "Machine learning is a field of artificial intelligence.",
//     "Supervised learning uses labeled training data."
// ];

// const result = await generateEmbeddings(chunks);

// console.log(result);

const chunks = [
    "Machine learning is a field of artificial intelligence.",
    "Supervised learning uses labeled training data."
];

const result = await generateEmbeddings(chunks);

console.log("Number of embeddings:", result.length);
console.log("Vector length:", result[0].vector.length);