import crypto from "node:crypto";

const getPointId = (documentId, chunkIndex) => {
    const hash = crypto
        .createHash("sha256")
        .update(`${documentId}:${chunkIndex}`)
        .digest();

    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;

    const value = hash.subarray(0, 16).toString("hex");

    return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};

export default getPointId;
