const uploadDocument = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

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

    return data;
};


const askQuestion = async (question, documentId) => {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/query`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: import.meta.env.VITE_AUTH_TOKEN
            },
            body: JSON.stringify({
                question: question,
                documentId: documentId
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Query failed: ${response.status}`);
    }

    const data = await response.json();

    return data;
};

const getDocument = async (documentId) => {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/documents/${encodeURIComponent(documentId)}`,
        {
            method: "GET",
            headers: {
                Authorization: import.meta.env.VITE_AUTH_TOKEN
            }
        }
    );

    if (!response.ok) {
        const error = new Error(`Document lookup failed: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();

    return data;
};


export {
    uploadDocument,
    askQuestion,
    getDocument
};
