import express from "express";
import auth from "../middleware/auth.js";
import errorHandler from "../middleware/errorHandler.js";
import {health , version} from "../controllers/healthController.js";
const router = express.Router();

// router.get("/health" , (req , res)=>{
//       res.json({
//         status: "OK",
//     });
// });

router.get("/health", health)

// router.get("/version", (req, res) => {
//     res.json({
//         version: "1.0.0",
//     });
// });

router.get("/version" , version);

router.get("/private", auth, (req, res) => {
    res.json({
        message: "Private Route"
    });
});

router.get("/test-error", (req, res, next) => {
    next(new Error("Testing global error handler"));
});

export default router;