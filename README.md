# RAG Document Q&A System

This repository contains a React/Vite frontend and a Node.js/Express backend. The backend accepts PDF uploads, extracts and chunks their text, creates Google Gemini embeddings, stores chunks in Qdrant, retrieves chunks for a question, and sends that context to Google Gemini to generate an answer.

## Current limits

This project is for local development only and must not be deployed publicly in its current state. Authorization is one shared token: backend routes compare the `Authorization` header with `AUTH`, and the frontend sends `VITE_AUTH_TOKEN` from browser code. Anyone who loads the frontend can read that token. Documents are stored in one Qdrant collection and associated with a `documentId`; the backend does not associate documents with a user or enforce document ownership. A person who has the shared token and another document's ID can query that document.

There is no deployment configuration in this repository. No Dockerfile, Compose file, Kubernetes manifest, CI deployment workflow, or platform configuration is included.

## Project structure

```text
QA-system/
├── rag_backend/
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── test/
└── rag-frontend/
    └── src/
        ├── components/
        ├── lib/
        └── services/
```

The backend services handle PDF ingestion, text chunking, embeddings, Qdrant storage and retrieval, and answer generation. The frontend contains the React app, API client, and chat and upload components.

## Runtime configuration

Backend configuration is validated in `rag_backend/src/config/env.js`. Copy `rag_backend/.env.example` to `.env` in the backend directory and set the required `AUTH` and `GEMINI_API_KEY` values. The example contains placeholders only.

| Variable | Required | Default or use |
|---|---:|---|
| `PORT` | No | `3000` |
| `AUTH` | Yes | Shared authorization token |
| `GEMINI_API_KEY` | Yes | Google Gemini API credential |
| `QDRANT_URL` | No | `http://127.0.0.1:6333` |
| `QDRANT_COLLECTION` | No | `documents` |
| `EMBEDDING_MODEL` | No | `gemini-embedding-2` |
| `GENERATION_MODEL` | No | `gemini-3.5-flash-lite` |
| `CHUNK_SIZE` | No | `1000` characters |
| `CHUNK_OVERLAP` | No | `200` characters; must be smaller than `CHUNK_SIZE` |
| `FRONTEND_URL` | Production: yes | Comma-separated exact frontend origins; defaults to `http://localhost:5173` outside production |
| `NODE_ENV` | No | `development` |

The frontend reads `VITE_API_URL` and `VITE_AUTH_TOKEN`. Copy `rag-frontend/.env.example` to `.env` in the frontend directory and set those values. The auth token is included in frontend code delivered to the browser; it is not a private server-side credential.

## Start locally

Run Qdrant separately at the configured `QDRANT_URL`. This repository does not configure or start Qdrant.

In one terminal, from `rag_backend/`:

```bash
npm ci
npm run dev
```

In another terminal, from `rag-frontend/`:

```bash
npm ci
npm run dev
```

The Vite development server normally uses `http://localhost:5173`; set `VITE_API_URL` to the backend origin and `VITE_AUTH_TOKEN` to the same shared token configured as backend `AUTH`.

## API

All endpoints are prefixed with `/api/v1`.

| Method and path | Authorization | Behavior |
|---|---|---|
| `GET /health` | No | Returns `{ "status": "OK" }`. |
| `GET /version` | No | Returns `{ "version": "1.0.0" }`. |
| `GET /private` | Yes | Returns `{ "message": "Private Route" }`. |
| `GET /test-error` | No | Exercises the global error handler. |
| `POST /documents` | Yes | Accepts multipart field `file`; the file must use MIME type `application/pdf`, start with `%PDF-`, and be no larger than 10 MB. |
| `GET /documents/:documentId` | Yes | Looks up a document by its 64-character hexadecimal SHA-256 ID. |
| `POST /query` | Yes | Accepts JSON with a question of 1–1000 characters, a 64-character hexadecimal `documentId`, and optional conversation history of up to six user/assistant messages. Each history message is limited to 1500 characters. |

The upload response includes `message`, `alreadyExists`, `documentId`, `filename`, and `chunkCount`. The query response includes `question`, `answer`, and `sources`. Query retrieval asks Qdrant for up to five chunks matching the given document ID. The successful response shapes are defined by the controllers.

The `Authorization` header must equal the configured shared `AUTH` value. There are no user accounts or per-user document permissions.

The frontend sends up to six recent chat messages with a query. If history is present, the backend asks the configured Gemini model to rewrite the latest message as a standalone retrieval question. The original question and recent history are then included in the answer prompt; retrieved PDF text remains the only factual source. The rewrite and answer prompts tell the model to treat history and document text as untrusted data, not instructions. First-turn questions skip the rewrite call.

## Storage and processing

The backend creates a Qdrant collection with 768-dimensional cosine vectors. PDF IDs are SHA-256 hashes of the uploaded bytes. Text is split into 1000-character chunks with 200 characters of overlap by default. Each chunk point ID is a deterministic UUID derived from the document ID and chunk index. Reprocessing a document upserts points with those IDs and removes older points whose chunk index is beyond the new chunk count.

Retrieved chunk text and the question are sent to the configured Gemini generation model. The prompt asks the model to answer from retrieved context and to say when that context is insufficient. This prompt does not provide a technical guarantee that generated content is correct.

## Tests and frontend checks

From `rag_backend/`:

```bash
npm test
```

The Node built-in tests cover chunking, deterministic point IDs, and HTTP validation cases without calling Gemini or Qdrant.

From `rag-frontend/`:

```bash
npm test
npm run lint
npm run build
```

The frontend and backend tests use Node's built-in test runner and do not call Gemini or Qdrant. The frontend package defines test, lint, and build scripts. The backend package defines test, start, and dev scripts.
