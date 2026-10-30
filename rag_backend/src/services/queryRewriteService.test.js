import assert from "node:assert/strict";
import test from "node:test";

process.env.AUTH = "test-token";
process.env.GEMINI_API_KEY = "test-key";

const { buildRewritePrompt, createQueryRewriter } = await import("./queryRewriteService.js");

test("follow-up questions are rewritten using recent conversation history", async () => {
    let prompt = "";
    const rewrite = createQueryRewriter(async (value) => {
        prompt = value;
        return "Explain the annual plan refund policy in more detail.";
    });

    const rewritten = await rewrite("Explain that more", [
        { role: "user", content: "What is the refund policy for annual plans?" },
        { role: "assistant", content: "Annual plans can be refunded within 30 days." }
    ]);

    assert.equal(rewritten, "Explain the annual plan refund policy in more detail.");
    assert.match(prompt, /What is the refund policy for annual plans/);
    assert.match(prompt, /Explain that more/);
    assert.match(prompt, /untrusted text data/);
});

test("first-turn questions skip the rewrite model", async () => {
    let called = false;
    const rewrite = createQueryRewriter(async () => {
        called = true;
        return "rewritten";
    });

    assert.equal(await rewrite("What is in the document?", []), "What is in the document?");
    assert.equal(called, false);
});

test("empty rewrite output falls back to the original question", async () => {
    const rewrite = createQueryRewriter(async () => "  ");

    assert.equal(await rewrite("Explain that more", [
        { role: "user", content: "Earlier question" }
    ]), "Explain that more");
});

test("rewrite prompt keeps history structured as JSON", () => {
    const prompt = buildRewritePrompt("Explain that more", [
        { role: "user", content: "Earlier question" }
    ]);

    assert.match(prompt, /\[\{"role":"user","content":"Earlier question"\}\]/);
});
