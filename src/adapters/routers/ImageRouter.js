import { Router } from "express";
import { 
    controllerGenerateProductImages,
    controllerGetAvailableStyles,
    controllerCheckImageGenerationService,
    controllerServeImage,
    controllerDownloadImage,
    controllerGetImageMetadata,
    controllerListGeneratedImages
} from "../controllers/ImageController.js";

export const imageRouter = Router();

// === ENDPOINTS DE GENERACIÓN ===

/**
 * POST /api/images/generate
 * Genera imágenes para un producto
 * 
 * Body:
 * {
 *   "productName": "string (requerido)",
 *   "productDescription": "string (requerido)", 
 *   "style": "string (opcional, default: 'profesional')",
 *   "variations": "number (opcional, default: 3)",
 *   "width": "number (opcional, default: 768)",
 *   "height": "number (opcional, default: 768)",
 *   "inferenceSteps": "number (opcional, default: 25)",
 *   "guidanceScale": "number (opcional, default: 7.5)"
 * }
 */
imageRouter.post("/generate", controllerGenerateProductImages);

/**
 * GET /api/images/styles
 * Obtiene la lista de estilos disponibles para generación
 */
imageRouter.get("/styles", controllerGetAvailableStyles);

/**
 * GET /api/images/service/status
 * Verifica el estado del servicio de generación de imágenes
 * (Python, dependencias, scripts, etc.)
 */
imageRouter.get("/service/status", controllerCheckImageGenerationService);

// === ENDPOINTS DE CONSULTA Y LISTADO ===

/**
 * GET /api/images/list
 * Lista todas las imágenes generadas con paginación
 * 
 * Query params:
 * - page: number (opcional, default: 1)
 * - limit: number (opcional, default: 10, max: 50)
 * - sessionId: string (opcional, filtrar por session_id específico)
 */
imageRouter.get("/list", controllerListGeneratedImages);

/**
 * GET /api/images/metadata/:imageId
 * Obtiene la metadata detallada de una imagen específica
 * 
 * Params:
 * - imageId: string (formato: sessionId_variacion, ej: "abc12345_01")
 */
imageRouter.get("/metadata/:imageId", controllerGetImageMetadata);

// === ENDPOINTS DE SERVIR ARCHIVOS ===

/**
 * GET /api/images/serve/:filename
 * Sirve una imagen generada para mostrar en el navegador
 * Incluye headers de caching apropiados
 * 
 * Params:
 * - filename: string (nombre del archivo de imagen)
 */
imageRouter.get("/serve/:filename", controllerServeImage);

/**
 * GET /api/images/download/:filename  
 * Descarga directa de una imagen generada
 * Configura headers para forzar descarga
 * 
 * Params:
 * - filename: string (nombre del archivo de imagen)
 */
imageRouter.get("/download/:filename", controllerDownloadImage);

// === DOCUMENTACIÓN DE ENDPOINTS ===

/**
 * GET /api/images/endpoints
 * Retorna documentación de todos los endpoints disponibles
 */
imageRouter.get("/endpoints", (req, res) => {
    res.json({
        success: true,
        data: {
            title: "API de Generación de Imágenes",
            version: "1.0.0",
            description: "API para generar imágenes de productos usando Stable Diffusion via Python",
            endpoints: [
                {
                    method: "POST",
                    path: "/api/images/generate",
                    description: "Genera imágenes para un producto",
                    required_body: ["productName", "productDescription"],
                    optional_body: ["style", "variations", "width", "height", "inferenceSteps", "guidanceScale"],
                    example_body: {
                        productName: "Chocolate Premium",
                        productDescription: "Chocolate artesanal 70% cacao con textura suave",
                        style: "premium",
                        variations: 3
                    }
                },
                {
                    method: "GET", 
                    path: "/api/images/styles",
                    description: "Lista de estilos disponibles para generación",
                    query_params: []
                },
                {
                    method: "GET",
                    path: "/api/images/service/status", 
                    description: "Estado del servicio de generación (Python, dependencias)",
                    query_params: []
                },
                {
                    method: "GET",
                    path: "/api/images/list",
                    description: "Lista paginada de imágenes generadas",
                    query_params: ["page", "limit", "sessionId"]
                },
                {
                    method: "GET", 
                    path: "/api/images/serve/:filename",
                    description: "Sirve imagen para mostrar en navegador",
                    params: ["filename"]
                },
                {
                    method: "GET",
                    path: "/api/images/download/:filename", 
                    description: "Descarga directa de imagen",
                    params: ["filename"]
                },
                {
                    method: "GET",
                    path: "/api/images/metadata/:imageId",
                    description: "Metadata detallada de una imagen",
                    params: ["imageId"]
                }
            ],
            available_styles: [
                "profesional", "artistico", "minimalista", 
                "natural", "premium", "divertido"
            ],
            image_formats: ["PNG"],
            max_variations_per_request: 10,
            timeout_seconds: 300
        }
    });
});

export default imageRouter;
