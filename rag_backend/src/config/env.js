import "dotenv/config";
import {z} from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    AUTH: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    QDRANT_URL: z.string().url().default("http://127.0.0.1:6333"),
    QDRANT_COLLECTION: z.string().min(1).default("documents"),
    EMBEDDING_MODEL: z.string().min(1).default("gemini-embedding-2"),
    GENERATION_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
    CHUNK_SIZE: z.coerce.number().int().positive().default(1000),
    CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(200),
    FRONTEND_URL: z.string().optional(),
    NODE_ENV: z.string().default("development")
}).superRefine((values, context) => {
    if (values.NODE_ENV === "production" && !values.FRONTEND_URL?.trim()) {
        context.addIssue({
            code: "custom",
            path: ["FRONTEND_URL"],
            message: "FRONTEND_URL is required in production"
        });
    }

    if (values.FRONTEND_URL) {
        const origins = values.FRONTEND_URL.split(",").map((origin) => origin.trim());

        for (const origin of origins) {
            try {
                if (!origin || new URL(origin).origin !== origin) {
                    throw new Error("Invalid origin");
                }
            } catch {
                context.addIssue({
                    code: "custom",
                    path: ["FRONTEND_URL"],
                    message: "FRONTEND_URL must contain comma-separated origins"
                });
                break;
            }
        }
    }

    if (values.CHUNK_OVERLAP >= values.CHUNK_SIZE) {
        context.addIssue({
            code: "custom",
            path: ["CHUNK_OVERLAP"],
            message: "CHUNK_OVERLAP must be smaller than CHUNK_SIZE"
        });
    }
});

export const env = envSchema.parse(process.env);

export const frontendOrigins = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(",").map((origin) => origin.trim())
    : ["http://localhost:5173"];
