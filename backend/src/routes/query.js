import express from "express";
import queryDocument from "../controllers/queryController.js";
import auth from "../middleware/auth.js"


const router=express.Router();

router.post("/query",
    auth , queryDocument
);


export default router;