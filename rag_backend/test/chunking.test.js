import assert from "node:assert/strict";
import test from "node:test";
import chunkText from "../src/services/chunkingService.js";

test("chunking keeps the configured overlap", () => {
    assert.deepEqual(chunkText("abcdefghij", 6, 2), ["abcdef", "efghij"]);
});

test("chunking returns no chunks for empty text", () => {
    assert.deepEqual(chunkText("", 6, 2), []);
});

test("chunking returns short text as one chunk", () => {
    assert.deepEqual(chunkText("abc", 6, 2), ["abc"]);
});

test("chunking handles exact and over-boundary text sizes", () => {
    assert.deepEqual(chunkText("abcdef", 6, 2), ["abcdef"]);
    assert.deepEqual(chunkText("abcdefg", 6, 2), ["abcdef", "efg"]);
});
