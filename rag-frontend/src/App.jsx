import { useCallback, useEffect, useState } from "react";

import DocumentUpload from "./components/DocumentUpload";
import QuestionInput from "./components/QuestionInput";
import ChatWindow from "./components/ChatWindow";
import { getDocument } from "./services/api.js";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [uploadError, setUploadError] = useState("");
    const [uploaded, setUploaded] = useState(false);
    const [activeDocumentId, setActiveDocumentId] = useState("");
    const [filename, setFilename] = useState("");
    const [restoringDocument, setRestoringDocument] = useState(() => (
        Boolean(localStorage.getItem("documentId"))
    ));
    const [restoreError, setRestoreError] = useState("");

    const [question, setQuestion] = useState("");
    const [asking, setAsking] = useState(false);
    const [queryError, setQueryError] = useState("");

    const [messages, setMessages] = useState([]);

    const restoreSavedDocument = useCallback(async () => {
        const savedDocumentId = localStorage.getItem("documentId");

        if (!savedDocumentId) {
            setRestoringDocument(false);
            return;
        }

        setRestoreError("");
        setRestoringDocument(true);

        try {
            const data = await getDocument(savedDocumentId);
            const savedFilename = localStorage.getItem("filename") || "Saved document";

            setUploaded(true);
            setActiveDocumentId(data.documentId);
            setFilename(savedFilename);
            setResult({
                message: "Document available",
                alreadyExists: true,
                documentId: data.documentId,
                filename: savedFilename,
                chunkCount: data.chunkCount
            });
        } catch (error) {
            if (error.status === 404) {
                localStorage.removeItem("documentId");
                localStorage.removeItem("filename");
                setUploaded(false);
                setActiveDocumentId("");
                setFilename("");
                setResult(null);
                setRestoreError("");
            } else {
                setUploaded(false);
                setRestoreError(
                    "Could not verify your saved document. Check that the backend is running, then try again."
                );
            }
        } finally {
            setRestoringDocument(false);
        }
    }, []);

    useEffect(() => {
        const savedDocumentId = localStorage.getItem("documentId");

        if (!savedDocumentId) {
            return;
        }

        let isCancelled = false;

        getDocument(savedDocumentId)
            .then((data) => {
                if (isCancelled) {
                    return;
                }

                const savedFilename = localStorage.getItem("filename") || "Saved document";

                setUploaded(true);
                setActiveDocumentId(data.documentId);
                setFilename(savedFilename);
                setResult({
                    message: "Document available",
                    alreadyExists: true,
                    documentId: data.documentId,
                    filename: savedFilename,
                    chunkCount: data.chunkCount
                });
                setRestoreError("");
            })
            .catch((error) => {
                if (isCancelled) {
                    return;
                }

                if (error.status === 404) {
                    localStorage.removeItem("documentId");
                    localStorage.removeItem("filename");
                    setUploaded(false);
                    setActiveDocumentId("");
                    setFilename("");
                    setResult(null);
                    setRestoreError("");
                } else {
                    setUploaded(false);
                    setRestoreError(
                        "Could not verify your saved document. Check that the backend is running, then try again."
                    );
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setRestoringDocument(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    const handleNewDocument = () => {
        setQueryError("");
        setQuestion("");
        setResult(null);
        setUploaded(false);
        setActiveDocumentId("");
        setFilename("");
        setRestoreError("");
        setMessages([]);
    };

    const handleUploadResult = (data) => {
        setResult(data);
        setUploaded(true);
        setActiveDocumentId(data.documentId);
        setFilename(data.filename);
        setFile(null);
        setRestoreError("");
        setMessages([]);
        localStorage.setItem("documentId", data.documentId);
        localStorage.setItem("filename", data.filename);
    };

    const handleQueryResult = (data) => {
        const userMessage = {
            id: Date.now(),
            role: "user",
            content: data.question,
            sources: []
        };

        const assistantMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: data.answer,
            sources: data.sources ?? []
        };

        setMessages((previousMessages) => [
            ...previousMessages,
            userMessage,
            assistantMessage
        ]);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleSelectSuggestion = (promptText) => {
        setQuestion(promptText);
    };

    return (
        <div className="app-shell">
            {/* Left Sidebar: PDF Memory Manager */}
            <aside className="sidebar-panel">
                <DocumentUpload
                    file={file}
                    setFile={setFile}
                    uploaded={uploaded}
                    activeDocumentId={activeDocumentId}
                    filename={filename}
                    restoringDocument={restoringDocument}
                    restoreError={restoreError}
                    uploadError={uploadError}
                    setUploadError={setUploadError}
                    result={result}
                    handleNewDocument={handleNewDocument}
                    handleUploadResult={handleUploadResult}
                    handleRestoreDocument={restoreSavedDocument}
                />
            </aside>

            {/* Central Workspace: Chat Window + Question Input */}
            <main className="chat-panel">
                <ChatWindow
                    messages={messages}
                    asking={asking}
                    filename={filename || result?.filename}
                    uploaded={uploaded}
                    restoringDocument={restoringDocument}
                    handleClearChat={handleClearChat}
                    onSelectSuggestion={handleSelectSuggestion}
                />

                <QuestionInput
                    uploaded={uploaded}
                    restoringDocument={restoringDocument}
                    question={question}
                    setQuestion={setQuestion}
                    asking={asking}
                    setAsking={setAsking}
                    queryError={queryError}
                    setQueryError={setQueryError}
                    handleQueryResult={handleQueryResult}
                    documentId={activeDocumentId}
                />
            </main>
        </div>
    );
}

export default App;
