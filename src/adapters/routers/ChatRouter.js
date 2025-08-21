import { Router } from "express";
import { controllerGenerateDetailedProductInfo } from "../controllers/ChatController.js";

export const chatRouter = Router();

//RUTAS GET
chatRouter.post("/generate-detailed-product-info", controllerGenerateDetailedProductInfo);