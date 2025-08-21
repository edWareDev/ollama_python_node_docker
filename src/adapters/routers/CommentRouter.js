import { Router } from "express";
import { 
    controllerGenerateProductComments,
    controllerSummarizeComments
} from "../controllers/CommentController.js";

export const commentRouter = Router();

// === ENDPOINTS DE COMENTARIOS ===

/**
 * POST /api/comments/generate
 * Genera comentarios realistas para un producto usando IA
 * 
 * Body:
 * {
 *   "productName": "string (requerido)",
 *   "productDescription": "string (requerido)", 
 *   "numberOfComments": "number (opcional, default: 5, max: 20)",
 *   "sentiment": "string (opcional, valores: 'positive', 'negative', 'mixed', default: 'mixed')"
 * }
 */
commentRouter.post("/generate", controllerGenerateProductComments);

/**
 * POST /api/comments/summarize
 * Resume y analiza comentarios de productos usando IA
 * 
 * Body:
 * {
 *   "productName": "string (requerido)",
 *   "comments": "array (requerido, max: 100 elementos)"
 * }
 * 
 * Los comentarios pueden ser:
 * - Array de strings: ["comentario 1", "comentario 2"]
 * - Array de objetos: [{"usuario": "Juan", "calificacion": 5, "comentario": "Excelente producto"}]
 */
commentRouter.post("/summarize", controllerSummarizeComments);

// === DOCUMENTACIÓN DE ENDPOINTS ===

/**
 * GET /api/comments/endpoints
 * Retorna documentación de todos los endpoints disponibles
 */
commentRouter.get("/endpoints", (req, res) => {
    res.json({
        success: true,
        data: {
            title: "API de Comentarios de Productos",
            version: "1.0.0",
            description: "API para generar y resumir comentarios de productos usando IA",
            endpoints: [
                {
                    method: "POST",
                    path: "/api/comments/generate",
                    description: "Genera comentarios realistas para un producto",
                    required_body: ["productName", "productDescription"],
                    optional_body: ["numberOfComments", "sentiment"],
                    example_body: {
                        productName: "Smartphone Pro X1",
                        productDescription: "Teléfono inteligente con cámara de 108MP, pantalla OLED de 6.7 pulgadas y batería de 5000mAh",
                        numberOfComments: 8,
                        sentiment: "mixed"
                    },
                    response_example: {
                        success: true,
                        message: "Comentarios generados exitosamente",
                        data: {
                            product_name: "Smartphone Pro X1",
                            comments: [
                                {
                                    usuario: "TechReviewer_23",
                                    calificacion: 5,
                                    comentario: "La cámara es increíble, las fotos salen nítidas incluso en poca luz",
                                    fecha_relativa: "hace 3 días",
                                    util: 12
                                }
                            ],
                            sentiment_type: "mixed",
                            total_comments: 8
                        }
                    }
                },
                {
                    method: "POST", 
                    path: "/api/comments/summarize",
                    description: "Resume y analiza comentarios de productos",
                    required_body: ["productName", "comments"],
                    example_body: {
                        productName: "Smartphone Pro X1",
                        comments: [
                            "Excelente producto, muy satisfecho con la compra",
                            {
                                usuario: "Maria123",
                                calificacion: 4,
                                comentario: "Buena calidad pero el precio es un poco alto"
                            }
                        ]
                    },
                    response_example: {
                        success: true,
                        message: "Comentarios resumidos exitosamente",
                        data: {
                            product_name: "Smartphone Pro X1",
                            total_comments_analyzed: 2,
                            summary: {
                                resumen_general: "Los usuarios están satisfechos en general...",
                                aspectos_positivos: ["Calidad del producto", "Satisfacción general"],
                                aspectos_negativos: ["Precio elevado"],
                                calificacion_promedio: 4.5,
                                recomendacion_mejoras: ["Considerar ajustar precios"],
                                sentiment_general: "positivo"
                            }
                        }
                    }
                }
            ],
            available_sentiments: ["positive", "negative", "mixed"],
            limits: {
                max_comments_generate: 20,
                max_comments_analyze: 100,
                max_product_name_length: 200,
                max_description_length: 1000
            }
        }
    });
});

export default commentRouter;
