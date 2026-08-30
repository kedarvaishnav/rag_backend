# RAG Document Q&A System

A Retrieval-Augmented Generation (RAG) based document question-answering system that allows users to upload PDF documents and ask questions about their content.

The system extracts text from uploaded PDFs, splits the text into chunks, generates vector embeddings, stores them in Qdrant, retrieves relevant chunks for a question, and generates an answer using only the retrieved document context.

## Features

- PDF document upload
- PDF text extraction
- Configurable text chunking
- Vector embedding generation
- Qdrant vector storage
- Deterministic SHA-256 document IDs
- Duplicate PDF ingestion prevention
- Multiple PDFs in one Qdrant collection
- Document-scoped similarity retrieval
- Context-grounded LLM answers
- Source information returned with answers
- Active-document management in the frontend
- Question and answer interface
- Chat-oriented frontend components
- Temporary upload cleanup
- Frontend document persistence/restoration

## System Architecture

```text
React Frontend
      |
      | HTTP
      v
Node.js + Express Backend
      |
      +-------------------+
      |                   |
      v                   v
RAG Services          Qdrant Vector DB
      |
      +--> PDF parsing
      +--> Chunking
      +--> Embeddings
      +--> Retrieval
      +--> Answer generation
```

## RAG Pipeline

```text
PDF
 |
 v
PDF Text Extraction
 |
 v
Text Chunking
 |
 v
Embedding Generation
 |
 v
Qdrant
 |
 |       User Question
 |              |
 |              v
 |       Question Embedding
 |              |
 +--------------+
                v
       Document-Scoped Search
                |
                v
         Relevant Chunks
                |
                v
        Generation Service
                |
                v
          Answer + Sources
```

## Project Structure

```text
QA-system/
|
├── rag_backend/
│   └── src/
│       ├── controllers/
│       │   ├── documentController.js
│       │   └── queryController.js
│       ├── middleware/
│       │   └── auth.js
│       ├── routes/
│       ├── services/
│       │   ├── ingestionService.js
│       │   ├── chunkingService.js
│       │   ├── embeddingService.js
│       │   ├── vectorService.js
│       │   ├── retrievalService.js
│       │   └── generationService.js
│       └── ...
│
├── rag-frontend/
│   └── src/
│       ├── components/
│       │   ├── DocumentUpload.jsx
│       │   ├── QuestionInput.jsx
│       │   ├── Answer.jsx
│       │   ├── Sources.jsx
│       │   ├── ChatWindow.jsx
│       │   ├── ChatMessage.jsx
│       │   └── SourceCitation.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       └── App.css
│
└── README.md
```

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React
- HTTP API communication

### Backend

- Node.js
- Express
- Multer
- PDF parsing
- JavaScript

### Vector Database

- Qdrant
- Cosine similarity
- 768-dimensional vectors

### Infrastructure

- Docker
- Qdrant container

## Document Ingestion

When a PDF is uploaded:

```text
Upload PDF
    |
    v
Read PDF bytes
    |
    v
Generate SHA-256 documentId
    |
    v
Check Qdrant
    |
    +---- Existing ----> Skip processing
    |
    +---- New ---------> Extract text
                           |
                           v
                         Chunk text
                           |
                           v
                     Generate embeddings
                           |
                           v
                       Store in Qdrant
```

## Deterministic Document IDs

Each PDF receives a deterministic document ID based on its actual raw bytes.

```javascript
const documentId = crypto
    .createHash("sha256")
    .update(dataBuffer)
    .digest("hex");
```

Therefore:

```text
Same PDF bytes
      |
      v
Same SHA-256 hash
      |
      v
Same documentId
```

Renaming a PDF does not change its document ID.

If the actual PDF contents change, the hash changes and the document is treated as a new document.

## Duplicate Document Prevention

Before parsing, chunking, embedding, or inserting a document, the backend checks whether its `documentId` already exists in Qdrant.

If it exists, the system skips:

- PDF parsing
- text chunking
- embedding generation
- Qdrant insertion

This prevents duplicate vectors and unnecessary embedding work.

### New document

```text
New PDF
  -> New documentId
  -> Process
  -> Embed
  -> Store
```

### Duplicate document

```text
Same PDF
  -> Same documentId
  -> Found in Qdrant
  -> Skip processing
```

## Qdrant Point IDs vs Document IDs

The deterministic `documentId` identifies the PDF.

Each chunk stored in Qdrant still receives its own unique point ID.

Conceptually:

```text
documentId
    |
    +-- chunk 0 -> Qdrant point UUID
    +-- chunk 1 -> Qdrant point UUID
    +-- chunk 2 -> Qdrant point UUID
    +-- chunk 3 -> Qdrant point UUID
```

The `documentId` groups chunks belonging to the same document, while the Qdrant point ID uniquely identifies an individual vector.

## Qdrant Payload

Each stored chunk contains metadata similar to:

```javascript
payload: {
    text: chunk.text,
    documentId: documentId,
    chunkIndex: index
}
```

## Document-Scoped Retrieval

Multiple PDFs can exist in the same Qdrant collection.

For example:

```text
PDF A -> documentId = AAA
PDF B -> documentId = BBB
PDF C -> documentId = CCC
```

When PDF B is active, the frontend sends its `documentId` with the question.

Qdrant then applies a document filter:

```javascript
filter: {
    must: [
        {
            key: "documentId",
            match: {
                value: documentId
            }
        }
    ]
}
```

The retrieval flow becomes:

```text
Question
   |
   v
Question embedding
   |
   v
Qdrant similarity search
   +
documentId filter
   |
   v
Only active-document chunks
```

This prevents chunks from another PDF from being used for the current question.

## Question Answering

The frontend sends both the question and active document ID.

Example request:

```json
{
    "question": "What is the main objective?",
    "documentId": "sha256-document-id"
}
```

The backend:

1. Validates the document ID.
2. Generates an embedding for the question.
3. Performs document-scoped retrieval.
4. Passes the retrieved chunks to the generation service.
5. Returns the answer and sources.

## LLM Grounding

The generation prompt instructs the model to answer using only the supplied context.

Important rules include:

- Do not use outside knowledge.
- Do not make unsupported assumptions.
- Do not invent facts, numbers, dates, names, or code.
- Use only information supported by the provided context.
- If the context is insufficient, return:

```text
I don't have enough information in the provided documents.
```

The prompt also instructs the model to use Markdown for structured explanations and fenced code blocks for code and commands.

## Source Citations

The query API returns the generated answer together with retrieved source information.

Example:

```json
{
    "question": "What is this document about?",
    "answer": "The document discusses...",
    "sources": []
}
```

Source information is based on the retrieved Qdrant chunks and can include:

- chunk text
- document ID
- chunk index
- relevance information

The frontend uses this information to display evidence associated with an answer.

## Frontend

The frontend is implemented with React and Vite.

It handles:

- PDF selection
- PDF upload
- active document state
- document restoration
- question input
- API communication
- loading states
- error states
- answer rendering
- source rendering
- chat UI

### Frontend Components

```text
App.jsx
|
├── DocumentUpload
├── QuestionInput
├── Answer
├── Sources
├── ChatWindow
├── ChatMessage
└── SourceCitation
```

The chat components provide a structured interface for displaying conversations and source evidence.

## Frontend Document Persistence

The active document information is persisted on the frontend so that restarting the React frontend does not unnecessarily require the same PDF to be uploaded again.

Expected flow:

```text
Upload PDF
    |
    v
Document becomes active
    |
    v
Document information is persisted
    |
    v
Frontend restarted
    |
    v
Active document restored
```

The document remains stored in Qdrant as long as Qdrant data has not been removed.

## Qdrant

The main Qdrant collection is:

```text
documents
```

Current vector configuration:

```text
Vector size: 768
Distance: Cosine
```

Multiple PDFs can share the same collection. They are separated logically using:

```text
payload.documentId
```

### Understanding `points_count`

Qdrant's `points_count` represents stored vector points/chunks, not the number of PDFs.

For example:

```text
PDF A -> 8 chunks
PDF B -> 12 chunks
PDF C -> 5 chunks

points_count = 25
```

Therefore:

```text
points_count != number of PDFs
```

## Docker

Qdrant is currently run using Docker.

Check running containers:

```bash
docker ps
```

A Qdrant container should expose port:

```text
6333
```

If an existing Qdrant container is stopped:

```bash
docker start <container-name>
```

Then verify:

```bash
docker ps
```

## Qdrant Persistence

Restarting the frontend does not remove documents from Qdrant.

Restarting the backend does not inherently remove documents either.

However, if a Qdrant container is recreated without persistent storage, its data may be lost.

For production, configure Qdrant with a persistent Docker volume or other persistent storage.

## Environment Variables

Do not commit secrets to GitHub.

Use environment variables for API keys and private configuration.

Example structure:

```env
PORT=5000
QDRANT_URL=http://localhost:6333
API_KEY=your-api-key
```

The exact variable names must match the project's actual configuration.

A `.env.example` file should contain placeholders only.

## Installation

Clone the repository:

```bash
git clone <your-github-repository-url>
cd QA-system
```

### Backend

```bash
cd rag_backend
npm install
```

Configure the required environment variables.

Start the backend using the script defined in `package.json`, for example:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd rag-frontend
npm install
npm run dev
```

The Vite frontend normally runs at:

```text
http://localhost:5173
```

## Running the Complete System

Recommended startup order:

```text
1. Start Qdrant
2. Start backend
3. Start frontend
```

Check Qdrant:

```bash
docker ps
```

Then start the backend and frontend.

The complete runtime flow is:

```text
React Frontend
      |
      v
Express Backend
      |
      +----> Document Ingestion ----> Qdrant
      |
      +----> Retrieval ------------> Qdrant
      |
      +----> Generation
```

## API Endpoints

### Upload Document

```http
POST /api/v1/documents
```

The endpoint accepts a PDF as multipart form data.

New document response:

```json
{
    "message": "Document processed successfully",
    "alreadyExists": false,
    "documentId": "sha256-hash",
    "filename": "example.pdf",
    "chunkCount": 12
}
```

Duplicate document response:

```json
{
    "message": "Document already exists",
    "alreadyExists": true,
    "documentId": "same-sha256-hash",
    "filename": "example.pdf",
    "chunkCount": 12
}
```

### Query Document

```http
POST /api/v1/query
```

Request:

```json
{
    "question": "What is the main objective?",
    "documentId": "sha256-document-id"
}
```

Example response:

```json
{
    "question": "What is the main objective?",
    "answer": "The main objective is...",
    "sources": []
}
```

## Testing

### Test 1 — First Upload

Upload a new PDF.

Expected:

```text
alreadyExists = false
```

The Qdrant point count increases according to the number of generated chunks.

### Test 2 — Same PDF

Upload the exact same PDF again.

Expected:

```text
alreadyExists = true
```

The Qdrant point count should remain unchanged.

### Test 3 — Rename PDF

Rename the same PDF and upload it.

Expected:

```text
same documentId
alreadyExists = true
```

No duplicate chunks should be inserted.

### Test 4 — Modify PDF

Modify the actual PDF and upload it.

Expected:

```text
different documentId
alreadyExists = false
```

The modified document is processed as a new document.

### Test 5 — Multiple Documents

Upload two different PDFs.

Make PDF B active and ask a question.

Expected:

```text
Only PDF B chunks are retrieved.
```

Make PDF A active and ask the question again.

Expected:

```text
Only PDF A chunks are retrieved.
```

### Test 6 — Frontend Restart

Upload a document, make it active, restart the frontend, and verify that the active document information is restored.

### Frontend Build

```bash
npm run build
```

### Frontend Lint

```bash
npm run lint
```

### Backend Syntax Check

```bash
node --check <file>
```

## Current Status

### Implemented

- [x] React + Vite frontend
- [x] Node.js + Express backend
- [x] PDF upload
- [x] PDF text extraction
- [x] Text chunking
- [x] Embedding generation
- [x] Qdrant vector storage
- [x] SHA-256 deterministic document IDs
- [x] Duplicate PDF detection
- [x] Duplicate ingestion prevention
- [x] Temporary upload cleanup
- [x] Multiple PDFs in one Qdrant collection
- [x] Document-scoped retrieval
- [x] `documentId` passed from frontend to backend
- [x] Qdrant filtering by `payload.documentId`
- [x] Context-grounded answer generation
- [x] Source information returned with answers
- [x] Frontend document persistence/restoration
- [x] Basic question-answer interface
- [x] Chat-oriented frontend components
- [x] Initial UI modernization

## Future Improvements

- [ ] Complete modern 2-column chat interface
- [ ] Sidebar PDF library/history
- [ ] Multiple document selection
- [ ] Document deletion
- [ ] Better source citation UI
- [ ] Expandable source evidence
- [ ] Improved Markdown rendering
- [ ] Streaming LLM responses
- [ ] Conversation persistence
- [ ] Retrieval reranking
- [ ] Hybrid search
- [ ] RAG evaluation dataset
- [ ] Retrieval quality metrics
- [ ] Answer quality metrics
- [ ] Automated backend tests
- [ ] Automated frontend tests
- [ ] Production logging and monitoring
- [ ] Production deployment
- [ ] Persistent Qdrant Docker volume
- [ ] Authentication improvements
- [ ] Better error handling

## Security

Never commit secrets to GitHub.

Do not commit:

```text
.env
```

or real API keys.

Use environment variables for:

- API keys
- database configuration
- authentication secrets
- service URLs
- private configuration

## Development Principles

The RAG pipeline is separated into independent services:

```text
PDF Processing
      |
      v
Chunking
      |
      v
Embedding Generation
      |
      v
Vector Storage
      |
      v
Retrieval
      |
      v
Answer Generation
```

This separation makes individual components easier to test, debug, replace, and improve.

The frontend follows a component-based architecture for the same reason.

## Project Goal

The long-term goal is to build a reliable document-grounded AI assistant that can:

1. Store multiple PDF documents.
2. Identify documents deterministically.
3. Avoid duplicate ingestion.
4. Retrieve information only from the selected document.
5. Generate answers grounded in retrieved evidence.
6. Clearly show the evidence used for each answer.
7. Provide a clean conversational user interface.
