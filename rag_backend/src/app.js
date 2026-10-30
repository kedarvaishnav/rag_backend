import express from "express";
import healthrouter from "./routes/health.js"
import cors from "cors";
import morgan from "morgan";
import notFound from "./middleware/notFound.js";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import auth from "./middleware/auth.js";
import documentrouter from "./routes/document.js";
import queryrouter from "./routes/query.js";
import { frontendOrigins } from "./config/env.js";


const app = express();

app.use(morgan("dev"));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || frontendOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Origin not allowed"));
    }
}));
app.use(express.json());
app.use(logger);
// app.use(auth);  globally only if it used every where
app.use("/api/v1" , queryrouter);
app.use("/api/v1", healthrouter);
app.use("/api/v1" ,documentrouter);

app.use(notFound);

app.use(errorHandler);


// app.get("/health", (req, res) => {
//     res.json({
//         status: "ok",
//     });
// });


export default app;
