import express from "express";
import healthrouter from "./routes/health.js"
import cors from "cors";
import morgan from "morgan";

app.use(morgan("dev"));
app.use(cors());
const app = express();

app.use(express.json());

// app.get("/health", (req, res) => {
//     res.json({
//         status: "ok",
//     });
// });

app.use("/", healthrouter);
export default app;