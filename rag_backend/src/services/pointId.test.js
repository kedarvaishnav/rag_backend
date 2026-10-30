import assert from "node:assert/strict";
import test from "node:test";
import getPointId from "./pointId.js";

test("point IDs are deterministic UUIDs for document chunks", () => {
    const documentId = "a".repeat(64);
    const firstId = getPointId(documentId, 0);

    assert.equal(getPointId(documentId, 0), firstId);
    assert.notEqual(getPointId(documentId, 1), firstId);
    assert.match(firstId, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
