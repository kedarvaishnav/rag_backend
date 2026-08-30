import { useState } from "react";
import {
    FileText,
    Upload,
    Copy,
    Check,
    Loader2,
    CheckCircle2,
    AlertCircle,
    FileUp,
    RefreshCw
} from "lucide-react";
import { uploadDocument as uploadDocumentApi } from "../services/api.js";

function DocumentUpload({
    file,
    setFile,
    uploaded,
    activeDocumentId,
    filename,
    restoringDocument,
    restoreError,
    uploadError,
    setUploadError,
    result,
    handleNewDocument,
    handleUploadResult,
    handleRestoreDocument
}) {
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const uploadDocument = async () => {
        if (!file) {
            setUploadError("Please select a PDF first");
            return;
        }

        setUploadError("");
        setUploading(true);

        try {
            const data = await uploadDocumentApi(file);
            handleUploadResult(data);
        } catch (error) {
            setUploadError(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCopyId = () => {
        if (!activeDocumentId) return;
        navigator.clipboard.writeText(activeDocumentId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
            setUploadError("Only PDF files are allowed");
            setFile(null);
            return;
        }

        handleNewDocument();
        setUploadError("");
        setFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            handleFileSelect(droppedFile);
        }
    };

    const truncateId = (id) => {
        if (!id) return "";
        if (id.length <= 16) return id;
        return `${id.slice(0, 8)}...${id.slice(-6)}`;
    };

    const currentFilename = filename || result?.filename || "Active Document";
    const currentChunkCount = result?.chunkCount ?? null;

    return (
        <div className="sidebar-container">
            {/* Header */}
            <div className="sidebar-header">
                <div className="brand-badge">
                    <FileText className="brand-icon" />
                    <span className="brand-title">RAG Assistant</span>
                </div>
            </div>

            {/* Restoring Document State */}
            {restoringDocument && (
                <div className="sidebar-card status-card checking-card">
                    <Loader2 className="animate-spin icon-spin text-indigo" />
                    <div>
                        <p className="card-title">Checking saved document</p>
                        <p className="card-subtitle">Verifying Qdrant vector storage...</p>
                    </div>
                </div>
            )}

            {/* Restore Error State */}
            {restoreError && !restoringDocument && (
                <div className="sidebar-card status-card error-card">
                    <AlertCircle className="icon-error" />
                    <div>
                        <p className="card-title">Saved document error</p>
                        <p className="card-subtitle">{restoreError}</p>
                        <button
                            type="button"
                            className="btn-retry"
                            onClick={handleRestoreDocument}
                        >
                            <RefreshCw className="btn-icon-sm" /> Retry Connection
                        </button>
                    </div>
                </div>
            )}

            {/* Active Document Card */}
            {uploaded && activeDocumentId && !restoringDocument && (
                <div className="sidebar-card active-doc-card">
                    <div className="active-doc-header">
                        <span className="badge-active">
                            <span className="pulse-dot"></span> Active Memory
                        </span>
                        <span className="status-indicator ready-status">
                            <CheckCircle2 className="status-icon" /> Ready
                        </span>
                    </div>

                    <div className="active-doc-body">
                        <div className="doc-icon-wrapper">
                            <FileText className="doc-file-icon" />
                        </div>
                        <div className="doc-details">
                            <h3 className="doc-filename" title={currentFilename}>
                                {currentFilename}
                            </h3>

                            {currentChunkCount !== null && (
                                <span className="chunk-badge">
                                    {currentChunkCount} chunks in memory
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="doc-meta-row">
                        <div className="id-meta">
                            <span className="meta-label">ID</span>
                            <code className="id-code" title={activeDocumentId}>
                                {truncateId(activeDocumentId)}
                            </code>
                        </div>
                        <button
                            type="button"
                            className={`btn-copy-id ${copied ? "copied" : ""}`}
                            onClick={handleCopyId}
                            title="Copy full document ID"
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
                    </div>
                </div>
            )}

            {/* Upload Zone */}
            <div className="upload-section">
                <div
                    className={`dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        id="pdf-file-input"
                        type="file"
                        accept=".pdf"
                        className="file-input-hidden"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                handleFileSelect(e.target.files[0]);
                            }
                        }}
                    />

                    <label htmlFor="pdf-file-input" className="dropzone-label">
                        <div className="upload-icon-circle">
                            <FileUp className="upload-icon" />
                        </div>
                        <div className="dropzone-text">
                            <p className="drop-main-text">
                                {isDragging ? "Drop PDF file here" : "Click to select or drag PDF"}
                            </p>
                            <p className="drop-sub-text">Only PDF files supported</p>
                        </div>
                    </label>

                    {file && (
                        <div className="selected-file-preview">
                            <FileText className="file-preview-icon" />
                            <span className="selected-file-name" title={file.name}>
                                {file.name}
                            </span>
                        </div>
                    )}
                </div>

                {file && (
                    <button
                        type="button"
                        className="btn-upload-submit"
                        onClick={uploadDocument}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin btn-icon" /> Processing PDF...
                            </>
                        ) : (
                            <>
                                <Upload className="btn-icon" /> Upload to Memory
                            </>
                        )}
                    </button>
                )}

                {uploadError && (
                    <div className="error-banner">
                        <AlertCircle className="error-banner-icon" />
                        <span>{uploadError}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentUpload;
