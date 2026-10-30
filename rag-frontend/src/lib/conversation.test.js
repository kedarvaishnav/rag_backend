import assert from "node:assert/strict";
import test from "node:test";
import getRecentHistory from "./conversation.js";

test("conversation history keeps the latest six user and assistant messages", () => {
    const messages = Array.from({ length: 8 }, (_, index) => ({
        id: index,
        role: index % 2 === 0 ? "user" : "assistant",
        content: `message ${index}`,
        sources: [{ text: "source" }]
    }));

    assert.deepEqual(getRecentHistory(messages), [
        { role: "user", content: "message 2" },
        { role: "assistant", content: "message 3" },
        { role: "user", content: "message 4" },
        { role: "assistant", content: "message 5" },
        { role: "user", content: "message 6" },
        { role: "assistant", content: "message 7" }
    ]);
});

test("conversation history limits each message to 1500 characters", () => {
    const history = getRecentHistory([
        { role: "user", content: "a".repeat(1600) }
    ]);

    assert.equal(history[0].content.length, 1500);
});

test("conversation history ignores invalid or empty messages", () => {
    assert.deepEqual(getRecentHistory([
        { role: "system", content: "ignore" },
        { role: "user", content: "  " },
        { role: "assistant", content: null }
    ]), []);
});
