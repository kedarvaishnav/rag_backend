const chunkText = (text, chunkSize, overlap) => {
    if (text.length === 0) {
        return [];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;

        const chunk = text.slice(start, end);

        chunks.push(chunk);

        if (end >= text.length) {
            break;
        }

        start += chunkSize - overlap;
    }

    return chunks;
};

export default chunkText;
