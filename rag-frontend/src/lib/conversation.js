const MAX_HISTORY_MESSAGES = 6;
const MAX_MESSAGE_LENGTH = 1500;

const getRecentHistory = (messages = []) => messages
    .filter((message) => (
        ["user", "assistant"].includes(message.role)
        && typeof message.content === "string"
        && message.content.trim() !== ""
    ))
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
        role: message.role,
        content: message.content.slice(0, MAX_MESSAGE_LENGTH)
    }));

export default getRecentHistory;
