import express from "express";

const router = express.Router();

router.get("/health" , (req , res)=>{
      res.json({
        status: "OK",
    });
});

router.get("/version", (req, res) => {
    res.json({
        version: "1.0.0",
    });
});

export default router;