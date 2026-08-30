import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Target } from "lucide-react";

function SourceCitation({ source, index }) {
    const [expanded, setExpanded] = useState(false);

    const text = source?.payload?.text || "No source text available";
    const relevance = source?.relevance;
    const chunkIndex = source?.payload?.chunkIndex;
    const documentId = source?.payload?.documentId;

    return (
        <div className={`source-citation-card ${expanded ? "expanded" : ""}`}>
            <button
                type="button"
                className="source-toggle-btn"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="source-toggle-left">
                    <span className="source-number-badge">[{index + 1}]</span>
                    <span className="source-label">Source Chunk {chunkIndex !== undefined ? `#${chunkIndex}` : ""}</span>
                    {relevance !== undefined && (
                        <span className="relevance-pill" title="Vector Similarity Relevance Score">
                            <Target className="pill-icon" />
                            {relevance.toFixed(3)}
                        </span>
                    )}
                </div>

                <div className="source-toggle-right">
                    {expanded ? (
                        <ChevronUp className="chevron-icon" />
                    ) : (
                        <ChevronDown className="chevron-icon" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="source-expanded-content">
                    <div className="source-meta-bar">
                        {relevance !== undefined && (
                            <div className="meta-item">
                                <span className="meta-key">Score:</span>
                                <span className="meta-val font-mono">{relevance.toFixed(4)}</span>
                            </div>
                        )}

                        {chunkIndex !== undefined && (
                            <div className="meta-item">
                                <span className="meta-key">Chunk Index:</span>
                                <span className="meta-val font-mono">{chunkIndex}</span>
                            </div>
                        )}

                        {documentId && (
                            <div className="meta-item">
                                <span className="meta-key">Doc Hash:</span>
                                <span className="meta-val font-mono" title={documentId}>
                                    {documentId.slice(0, 8)}...{documentId.slice(-6)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="source-text-block">
                        <FileText className="source-text-icon" />
                        <p className="source-text">{text}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SourceCitation;