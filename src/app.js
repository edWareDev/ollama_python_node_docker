import express from "express";
import cors from "cors";
import { chatRouter } from "./adapters/routers/ChatRouter.js";
import { startServer } from "../config/api-rest.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', chatRouter);

await startServer(app);