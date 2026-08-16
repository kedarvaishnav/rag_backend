import { useState } from "react";

function App() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [uploadError, setUploadError] = useState("");

    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [answer, setAnswer] = useState("");
    const [queryError, setQueryError] = useState("");

    const uploadDocument = async () => {
        if (!file) {
            setUploadError("Please select a PDF first");
            return;
        }

        setUploadError("");
        setResult(null);

        const formData = new FormData();

        formData.append("file", file);

        setUploading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/v1/documents`,
                {
                    method: "POST",
                    headers: {
                        Authorization: import.meta.env.VITE_AUTH_TOKEN
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const data = await response.json();

            setResult(data);

            console.log(data);

        } catch (error) {
            setUploadError(error.message);
            console.log("Upload failed:", error);

        } finally {
            setUploading(false);
        }
    };

    const askQuestion = async () => {
        if (question.trim() === "") {
            setQueryError("Please ask a question");
            return;
        }

        setQueryError("");
        setAnswer("");
        setAsking(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/v1/query`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: import.meta.env.VITE_AUTH_TOKEN
                    },
                    body: JSON.stringify({
                        question: question
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Query failed: ${response.status}`);
            }

            const data = await response.json();

            setAnswer(data.answer);

            console.log(data);

        } catch (error) {
            setQueryError(error.message);
            console.log("Query failed:", error);

        } finally {
            setAsking(false);
        }
    };

    return (
        <div>
            <h1>RAG DOCUMENT Q&A</h1>

            {/* PDF Upload */}

            <input
                type="file"
                accept=".pdf"
                onChange={(event) => {
                    setFile(event.target.files[0]);
                }}
            />

            {file && (
                <p>
                    Selected file: {file.name}
                </p>
            )}

            <button
                onClick={uploadDocument}
                disabled={uploading}
            >
                {uploading ? "Uploading..." : "Upload Document"}
            </button>

            {/* Upload Result */}

            {result && (
                <div>
                    <h3>Upload Successful</h3>

                    <p>
                        Message: {result.message}
                    </p>

                    <p>
                        File: {result.filename}
                    </p>

                    <p>
                        Chunks: {result.chunkCount}
                    </p>
                </div>
            )}

            {uploadError && (
                <p>
                    Error: {uploadError}
                </p>
            )}

            {/* Question */}

            <h2>Ask a Question</h2>

            <input
                type="text"
                value={question}
                onChange={(event) => {
                    setQuestion(event.target.value);
                }}
                placeholder="Ask something about the document..."
            />

            <button
                onClick={askQuestion}
                disabled={asking}
            >
                {asking ? "Asking..." : "Ask Question"}
            </button>

            {/* Query Error */}

            {queryError && (
                <p>
                    Error: {queryError}
                </p>
            )}

            {/* Answer */}

            {answer && (
                <div>
                    <h3>Answer</h3>
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}

export default App;