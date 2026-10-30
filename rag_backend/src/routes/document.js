import express from "express";
import multer from "multer";
import fs from "fs/promises";
import auth from "../middleware/auth.js";
import uploadDocument, { getDocument } from "../controllers/documentController.js";

const router = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype !== "application/pdf") {
            const error = new Error("Only PDF files are accepted");
            error.status = 400;
            callback(error);
            return;
        }

        callback(null, true);
    }
});

const uploadSingleDocument = (req, res, next) => {
    upload.single("file")(req, res, async (error) => {
        if (error) {
            if (req.file?.path) {
                await fs.unlink(req.file.path).catch(() => {});
            }

            if (error.code === "LIMIT_FILE_SIZE") {
                error.status = 413;
            }

            next(error);
            return;
        }

        next();
    });
};

router.post(
    "/documents",
    auth,
    uploadSingleDocument,
    uploadDocument
);

router.get(
    "/documents/:documentId",
    auth,
    getDocument
);

export default router;
