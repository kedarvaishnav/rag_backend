const chunkText = (text, chunkSize, overlap) => {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;

        const chunk = text.slice(start, end);

        chunks.push(chunk);

        start += chunkSize - overlap;
    }

    return chunks;
};

export default chunkText;