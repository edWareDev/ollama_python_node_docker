import express from "express";
import cors from "cors";
import { chatRouter } from "./adapters/routers/ChatRouter.js";
import { imageRouter } from "./adapters/routers/ImageRouter.js";
import { commentRouter } from "./adapters/routers/CommentRouter.js";
import { startServer } from "../config/api-rest.js";

export const app = express();

// Politicas de Acceso CORS - CUalquier dispositivo puede acceder cone sta configuracion
app.use(cors());
app.use(express.json());

//Creación de rutas  a la API
app.use('/api/chat', chatRouter);
app.use('/api/images', imageRouter);
app.use('/api/comments', commentRouter);

await startServer(app);