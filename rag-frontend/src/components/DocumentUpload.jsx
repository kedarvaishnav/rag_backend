import { useState } from "react";
import { uploadDocument as uploadDocumentApi } from "../services/api.js";

function DocumentUpload({
    file,
    setFile,
    uploaded,
    uploadError,
    setUploadError,
    result,
    handleNewDocument,
    handleUploadResult
}) {
    const [uploading, setUploading] = useState(false);

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
            // console.log("Upload failed:", error);

        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <h2>Upload Document</h2>

            <input
                type="file"
                accept=".pdf"
                onChange={(event) => {
                    const selectedFile = event.target.files[0];

                    if (!selectedFile) {
                        return;
                    }

                    if (selectedFile.type !== "application/pdf") {
                        setUploadError("Only PDF files are allowed");
                        setFile(null);
                        return;
                    }

                    handleNewDocument();

                    setUploadError("");
                    setFile(selectedFile);
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

            {uploaded && (
                <p>
                    Document uploaded successfully.
                </p>
            )}

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
        </div>
    );
}

export default DocumentUpload;