import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import uploadDocument, { getDocument } from "../controllers/documentController.js";

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

router.post(
    "/documents",
    auth,
    upload.single("file"),
    uploadDocument
);

router.get(
    "/documents/:documentId",
    auth,
    getDocument
);

export default router;
