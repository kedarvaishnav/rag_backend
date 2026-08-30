import { useEffect, useRef } from "react";
import {
    FileText,
    Sparkles,
    Trash2,
    Loader2,
    MessageSquare,
    Bot,
    HelpCircle
} from "lucide-react";
import ChatMessage from "./ChatMessage.jsx";

function ChatWindow({
    messages = [],
    asking = false,
    filename = "",
    uploaded = false,
    restoringDocument = false,
    handleClearChat,
    onSelectSuggestion
}) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, asking]);

    const suggestions = [
        "Summarize the main points of this document.",
        "What are the key conclusions or findings?",
        "Explain the core topics discussed in this PDF."
    ];

    return (
        <div className="chat-window-container">
            {/* Workspace Header */}
            <div className="chat-workspace-header">
                <div className="header-left">
                    <MessageSquare className="header-icon" />
                    <div>
                        <h2 className="workspace-title">Document Q&A Workspace</h2>
                        {uploaded && filename ? (
                            <div className="active-doc-pill" title={filename}>
                                <FileText className="pill-doc-icon" />
                                <span className="pill-doc-name">{filename}</span>
                                <span className="pill-dot"></span>
                                <span className="pill-status">Active</span>
                            </div>
                        ) : restoringDocument ? (
                            <span className="active-doc-pill loading-pill">
                                <Loader2 className="animate-spin pill-doc-icon" /> Verifying document...
                            </span>
                        ) : (
                            <span className="active-doc-pill idle-pill">
                                No active document selected
                            </span>
                        )}
                    </div>
                </div>

                <div className="header-right">
                    {messages.length > 0 && (
                        <button
                            type="button"
                            className="btn-clear-chat"
                            onClick={handleClearChat}
                            title="Clear conversation messages"
                        >
                            <Trash2 className="btn-icon-sm" /> Clear Chat
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Message Thread */}
            <div className="chat-messages-area">
                {messages.length === 0 ? (
                    <div className="chat-empty-state">
                        <div className="empty-sparkle-circle">
                            <Sparkles className="sparkle-icon" />
                        </div>
                        <h3 className="empty-title">Ask anything about your document</h3>
                        <p className="empty-subtitle">
                            Your questions are answered using evidence retrieved strictly from the currently active PDF.
                        </p>

                        <div className="suggestions-box">
                            <div className="suggestions-header">
                                <HelpCircle className="suggestions-icon" />
                                <span>Try asking one of these:</span>
                            </div>
                            <div className="suggestions-chips">
                                {suggestions.map((promptText, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="suggestion-chip"
                                        onClick={() => onSelectSuggestion && onSelectSuggestion(promptText)}
                                    >
                                        "{promptText}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="messages-thread">
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={message.id || index}
                                role={message.role}
                                content={message.content}
                                sources={message.sources}
                            />
                        ))}

                        {/* Thinking Indicator */}
                        {asking && (
                            <div className="chat-message-row assistant-row thinking-row">
                                <div className="message-avatar">
                                    <Bot className="avatar-icon bot-avatar-icon pulse-bot" />
                                </div>
                                <div className="message-content-wrapper">
                                    <div className="message-header">
                                        <span className="sender-name">AI Assistant</span>
                                    </div>
                                    <div className="message-bubble thinking-bubble">
                                        <span className="thinking-text">AI is thinking</span>
                                        <div className="typing-dots">
                                            <span className="dot dot1"></span>
                                            <span className="dot dot2"></span>
                                            <span className="dot dot3"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatWindow;