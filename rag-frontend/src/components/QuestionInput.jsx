import { useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { askQuestion as askQuestionApi } from "../services/api.js";
import getRecentHistory from "../lib/conversation.js";

function QuestionInput({
    uploaded,
    restoringDocument,
    question,
    setQuestion,
    asking,
    setAsking,
    queryError,
    setQueryError,
    handleQueryResult,
    documentId,
    messages = []
}) {
    const textareaRef = useRef(null);

    const askQuestion = async () => {
        if (restoringDocument) {
            setQueryError("Checking saved document. Please wait.");
            return;
        }

        if (!uploaded) {
            setQueryError("Please upload a PDF first");
            return;
        }

        if (!documentId) {
            setQueryError("No active document selected");
            return;
        }

        if (question.trim() === "") {
            setQueryError("Please ask a question");
            return;
        }

        setQueryError("");
        setAsking(true);

        try {
            const data = await askQuestionApi(question, documentId, getRecentHistory(messages));
            handleQueryResult(data);
            setQuestion("");
        } catch (error) {
            setQueryError(error.message || "Query failed");
        } finally {
            setAsking(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!restoringDocument && uploaded && question.trim() !== "" && !asking) {
                askQuestion();
            }
        }
    };

    // Auto-resize textarea height as user types
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [question]);

    const isSubmitDisabled = restoringDocument || !uploaded || asking || question.trim() === "";

    return (
        <div className="question-input-wrapper">
            {queryError && (
                <div className="query-error-toast">
                    <AlertCircle className="toast-icon" />
                    <span className="toast-message">{queryError}</span>
                </div>
            )}

            <div className={`question-input-box ${asking ? "asking" : ""} ${!uploaded ? "disabled-box" : ""}`}>
                <textarea
                    ref={textareaRef}
                    className="question-textarea"
                    rows={1}
                    value={question}
                    maxLength={500}
                    disabled={restoringDocument || !uploaded || asking}
                    onChange={(event) => {
                        setQuestion(event.target.value);
                        if (queryError) setQueryError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        restoringDocument
                            ? "Checking document storage..."
                            : !uploaded
                                ? "Upload a PDF document first to ask questions..."
                                : "Ask something about the document... (Press Enter to send)"
                    }
                />

                <div className="input-actions-bar">
                    <span className={`char-counter ${question.length >= 480 ? "near-limit" : ""}`}>
                        {question.length} / 500
                    </span>

                    <button
                        type="button"
                        className="btn-send-question"
                        onClick={askQuestion}
                        disabled={isSubmitDisabled}
                        title="Send question"
                    >
                        {asking ? (
                            <Loader2 className="animate-spin send-icon" />
                        ) : (
                            <Send className="send-icon" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuestionInput;
