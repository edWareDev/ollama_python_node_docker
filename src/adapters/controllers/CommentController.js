import { generateProductComments } from "../../usecases/comments/GenerateProductComments.js";
import { summarizeProductComments } from "../../usecases/comments/SummarizeComments.js";
import { CustomError } from "../../utils/CustomError.js";
import { fetchResponse } from "../../utils/fetchResponse.js";
import { HTTP_CODES } from "../../utils/http_error_codes.js";

/**
 * Controller para generar comentarios de productos usando IA
 */
export async function controllerGenerateProductComments(req, res) {
    try {
        // Obtener datos del body de la solicitud
        const data = req.body;
        console.log("💬 ~ controllerGenerateProductComments ~ data:", data);

        // Llamar al caso de uso para generar comentarios
        const result = await generateProductComments(data);

        // Verificar si hubo errores
        if (result.error) {
            throw new CustomError('Error al generar comentarios del producto', HTTP_CODES._400_BAD_REQUEST, result.error);
        }

        res.status(200).json({
            success: true,
            message: "Comentarios generados exitosamente",
            data: result.data
        });

    } catch (error) {
        console.error('Controller error:', error.message);
        
        if (error instanceof CustomError) {
            const { message, httpErrorCode, errorCode } = error.toJSON();
            fetchResponse(res, { statusCode: httpErrorCode, message, errorCode });
        } else {
            fetchResponse(res, { 
                statusCode: HTTP_CODES._500_INTERNAL_SERVER_ERROR, 
                errorCode: "ERR_UNEXPECTED", 
                message: "Ha ocurrido un error inesperado al generar comentarios" 
            });
        }
    }
}

/**
 * Controller para resumir comentarios de productos usando IA
 */
export async function controllerSummarizeComments(req, res) {
    try {
        // Obtener datos del body de la solicitud
        const data = req.body;
        console.log("📊 ~ controllerSummarizeComments ~ data:", data);

        // Llamar al caso de uso para resumir comentarios
        const result = await summarizeProductComments(data);

        // Verificar si hubo errores
        if (result.error) {
            throw new CustomError('Error al resumir comentarios del producto', HTTP_CODES._400_BAD_REQUEST, result.error);
        }

        res.status(200).json({
            success: true,
            message: "Comentarios resumidos exitosamente",
            data: result.data
        });

    } catch (error) {
        console.error('Controller error:', error.message);
        
        if (error instanceof CustomError) {
            const { message, httpErrorCode, errorCode } = error.toJSON();
            fetchResponse(res, { statusCode: httpErrorCode, message, errorCode });
        } else {
            fetchResponse(res, { 
                statusCode: HTTP_CODES._500_INTERNAL_SERVER_ERROR, 
                errorCode: "ERR_UNEXPECTED", 
                message: "Ha ocurrido un error inesperado al resumir comentarios" 
            });
        }
    }
}
