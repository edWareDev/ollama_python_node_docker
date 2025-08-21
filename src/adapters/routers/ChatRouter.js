import { Router } from "express";
import { controller } from "../controllers/ChatController.js";

export const chatRouter = Router();

//RUTAS GET
chatRouter.get("/", controller);