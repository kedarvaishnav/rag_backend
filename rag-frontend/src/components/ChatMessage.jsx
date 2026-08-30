import { useState } from "react";
import { User, Bot, Copy, Check, Layers, Code } from "lucide-react";
import SourceCitation from "./SourceCitation.jsx";

function FormattedContent({ text }) {
    if (!text) return null;

    // Split text by markdown fenced code blocks: ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: "text",
                content: text.slice(lastIndex, match.index)
            });
        }

        parts.push({
            type: "code",
            language: match[1] || "code",
            code: match[2].trim()
        });

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push({
            type: "text",
            content: text.slice(lastIndex)
        });
    }

    // If no code blocks were found, render clean text
    if (parts.length === 0) {
        return <p className="message-text">{text}</p>;
    }

    return (
        <div className="formatted-markdown">
            {parts.map((part, i) => {
                if (part.type === "code") {
                    return <CodeBlock key={i} language={part.language} code={part.code} />;
                }

                return (
                    <p key={i} className="message-text prose-block">
                        {part.content}
                    </p>
                );
            })}
        </div>
    );
}

function CodeBlock({ language, code }) {
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <div className="code-lang-tag">
                    <Code className="code-header-icon" />
                    <span>{language || "code"}</span>
                </div>
                <button
                    type="button"
                    className={`btn-copy-code ${copiedCode ? "copied" : ""}`}
                    onClick={handleCopyCode}
                >
                    {copiedCode ? (
                        <>
                            <Check className="btn-icon-xs text-green" /> Copied Code
                        </>
                    ) : (
                        <>
                            <Copy className="btn-icon-xs" /> Copy Code
                        </>
                    )}
                </button>
            </div>
            <pre className="code-pre">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function ChatMessage({ role, content, sources = [] }) {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopyAnswer = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`chat-message-row ${isUser ? "user-row" : "assistant-row"}`}>
            <div className="message-avatar">
                {isUser ? (
                    <User className="avatar-icon user-avatar-icon" />
                ) : (
                    <Bot className="avatar-icon bot-avatar-icon" />
                )}
            </div>

            <div className="message-content-wrapper">
                <div className="message-header">
                    <span className="sender-name">{isUser ? "You" : "AI Assistant"}</span>

                    {!isUser && content && (
                        <button
                            type="button"
                            className={`btn-copy-answer ${copied ? "copied" : ""}`}
                            onClick={handleCopyAnswer}
                            title="Copy answer text"
                        >
                            {copied ? (
                                <>
                                    <Check className="btn-icon-xs text-green" /> Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="btn-icon-xs" /> Copy
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="message-bubble">
                    <FormattedContent text={content} />
                </div>

                {!isUser && sources && sources.length > 0 && (
                    <div className="sources-container">
                        <div className="sources-header">
                            <Layers className="sources-header-icon" />
                            <span className="sources-title">Retrieved Evidence</span>
                            <span className="sources-count-badge">Sources · {sources.length}</span>
                        </div>

                        <div className="sources-list">
                            {sources.map((source, index) => (
                                <SourceCitation
                                    key={source.id || index}
                                    source={source}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatMessage;