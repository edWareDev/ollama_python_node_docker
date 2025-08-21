import { Router } from "express";
import { controllerGenerateDetailedProductInfo } from "../controllers/ChatController.js";

export const chatRouter = Router();

//RUTAS GET
chatRouter.get("/", controllerGenerateDetailedProductInfo);