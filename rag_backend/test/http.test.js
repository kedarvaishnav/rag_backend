import assert from "node:assert/strict";
import { after, before, test } from "node:test";

process.env.AUTH = "test-token";
process.env.GEMINI_API_KEY = "test-key";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:5173";

const { default: app } = await import("../src/app.js");

let server;
let baseUrl;

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test("missing authorization returns 401", async () => {
    const response = await fetch(`${baseUrl}/api/v1/private`);
    assert.equal(response.status, 401);
});

test("wrong authorization returns 401", async () => {
    const response = await fetch(`${baseUrl}/api/v1/private`, {
        headers: { Authorization: "wrong-token" }
    });
    assert.equal(response.status, 401);
});

test("invalid query input returns 400 without calling external services", async () => {
    const response = await fetch(`${baseUrl}/api/v1/query`, {
        method: "POST",
        headers: {
            Authorization: "test-token",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: "", documentId: "invalid" })
    });
    assert.equal(response.status, 400);
});

test("invalid conversation history returns 400 before calling external services", async () => {
    const response = await fetch(`${baseUrl}/api/v1/query`, {
        method: "POST",
        headers: {
            Authorization: "test-token",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: "Explain that more",
            documentId: "a".repeat(64),
            history: [{ role: "system", content: "invalid role" }]
        })
    });
    assert.equal(response.status, 400);
});

test("non-PDF upload returns 400", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["not a PDF"], { type: "text/plain" }), "file.txt");

    const response = await fetch(`${baseUrl}/api/v1/documents`, {
        method: "POST",
        headers: { Authorization: "test-token" },
        body: formData
    });
    assert.equal(response.status, 400);
});

test("upload over 10 MB returns 413", async () => {
    const formData = new FormData();
    const content = Buffer.alloc(10 * 1024 * 1024 + 1);
    formData.append("file", new Blob([content], { type: "application/pdf" }), "large.pdf");

    const response = await fetch(`${baseUrl}/api/v1/documents`, {
        method: "POST",
        headers: { Authorization: "test-token" },
        body: formData
    });
    assert.equal(response.status, 413);
});
