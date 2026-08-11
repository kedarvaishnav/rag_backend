import app from "./app.js";
import { env } from "./config/env.js";
import { initializeCollection } from "./services/vectorService.js";

await initializeCollection();

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});