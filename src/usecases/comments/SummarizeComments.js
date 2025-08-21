import { ZodError } from "zod";
import { summarizeCommentsSchema } from "../../adapters/web/validators/commentValidators.js";
import { OpenAiClient } from "../../infraestructure/services/openAIService.js";
import { ollamaConfig } from "../../../config/ollama.js";
import { parseJSONByIA } from "../../utils/parseIJSONGeneratedByIa.js";

/**
 * Calcula estadísticas reales de los comentarios
 * @param {Array} comments - Array de comentarios
 * @returns {Object} Estadísticas calculadas
 */
const calculateCommentStats = (comments) => {
    const ratings = [];
    let totalUtilVotes = 0;
    let validCommentsCount = 0;
    
    comments.forEach(comment => {
        let rating = null;
        let utilVotes = 0;
        
        if (typeof comment === 'object' && comment !== null) {
            // Extraer calificación
            rating = comment.calificacion || comment.rating || comment.score;
            // Extraer votos útiles
            utilVotes = comment.util || comment.helpful || comment.votes || 0;
        } else if (typeof comment === 'string') {
            // Intentar extraer calificación de texto (formato "5/5", "4 estrellas", etc.)
            const ratingMatch = comment.match(/(\d+)[\/\s]*(?:estrellas?|stars?|5|de\s*5)?/i);
            if (ratingMatch) {
                rating = parseInt(ratingMatch[1]);
            }
        }
        
        if (rating !== null && !isNaN(rating) && rating >= 1 && rating <= 5) {
            ratings.push(rating);
            validCommentsCount++;
        }
        
        if (!isNaN(utilVotes) && utilVotes > 0) {
            totalUtilVotes += utilVotes;
        }
    });
    
    const averageRating = ratings.length > 0 ? 
        Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 100) / 100 : null;
    
    const ratingDistribution = {
        1: ratings.filter(r => r === 1).length,
        2: ratings.filter(r => r === 2).length,
        3: ratings.filter(r => r === 3).length,
        4: ratings.filter(r => r === 4).length,
        5: ratings.filter(r => r === 5).length
    };
    
    // Calcular sentimiento basado en distribución de calificaciones
    let calculatedSentiment = 'neutro';
    if (averageRating) {
        if (averageRating >= 4.0) {
            calculatedSentiment = 'positivo';
        } else if (averageRating >= 3.0) {
            calculatedSentiment = 'neutro';
        } else {
            calculatedSentiment = 'negativo';
        }
        
        // Ajustar para casos mixtos
        const positiveCount = ratingDistribution[4] + ratingDistribution[5];
        const negativeCount = ratingDistribution[1] + ratingDistribution[2];
        if (positiveCount > 0 && negativeCount > 0 && Math.abs(positiveCount - negativeCount) <= 1) {
            calculatedSentiment = 'mixto';
        }
    }
    
    return {
        averageRating,
        totalRatings: ratings.length,
        ratingDistribution,
        totalUtilVotes,
        validCommentsCount,
        calculatedSentiment
    };
};

export const summarizeProductComments = async (data) => {
    try {
        // Validar información de entrada
        const validationResult = summarizeCommentsSchema.safeParse(data);

        if (!validationResult.success) {
            return { error: validationResult.error.issues.map(issue => issue.message) };
        }

        const { comments, productName } = validationResult.data;

        if (!Array.isArray(comments) || comments.length === 0) {
            return { error: "Debe proporcionar al menos un comentario para resumir" };
        }

        // Calcular estadísticas reales
        const stats = calculateCommentStats(comments);

        // Convertir comentarios a texto para el prompt
        const commentsText = comments.map((comment, index) => {
            if (typeof comment === 'string') {
                return `${index + 1}. ${comment}`;
            } else if (typeof comment === 'object') {
                return `${index + 1}. Usuario: ${comment.usuario || 'Anónimo'} | Calificación: ${comment.calificacion || 'N/A'}/5 | Comentario: ${comment.comentario || comment.comment || comment.texto || 'Sin comentario'}`;
            }
            return `${index + 1}. ${String(comment)}`;
        }).join('\n');

        const SYSTEM_PROMPT = `Eres experto en análisis de opiniones de clientes. Debes responder ÚNICAMENTE con un objeto JSON válido que contenga las claves "resumen_general", "aspectos_positivos", "aspectos_negativos", "recomendacion_mejoras" y "sentiment_general". ${stats.averageRating ? `La calificación promedio calculada es ${stats.averageRating}/5 basada en ${stats.totalRatings} calificaciones.` : 'No se pudieron extraer calificaciones numéricas de los comentarios.'} No incluyas texto adicional, markdown, ni explicaciones. Solo el JSON.`;

        const USER_PROMPT = `Analiza y resume los siguientes comentarios del producto "${productName}":

${commentsText}

Estadísticas calculadas:
- Total de comentarios: ${comments.length}
- Comentarios con calificación: ${stats.totalRatings}
- Calificación promedio: ${stats.averageRating || 'N/A'}/5
- Distribución: 5⭐(${stats.ratingDistribution[5]}) 4⭐(${stats.ratingDistribution[4]}) 3⭐(${stats.ratingDistribution[3]}) 2⭐(${stats.ratingDistribution[2]}) 1⭐(${stats.ratingDistribution[1]})
- Sentimiento calculado: ${stats.calculatedSentiment}

Genera un resumen ejecutivo que incluya:
- Resumen general de las opiniones
- Aspectos más valorados positivamente (basándote en los comentarios)
- Aspectos más criticados (basándote en los comentarios)
- Recomendaciones para mejoras específicas
- Sentimiento general que coincida con las estadísticas calculadas`;

        const respuesta = await OpenAiClient.chat.completions.create({
            model: ollamaConfig.model,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: USER_PROMPT
                }
            ],
            temperature: 0.3 // Temperatura más baja para análisis más consistente
        });

        // Obtener la respuesta directa de IA
        const rawContent = respuesta.choices[0].message.content.trim();

        // Convertir a Objeto JSON
        const jsonResponse = parseJSONByIA(rawContent);

        // Combinar respuesta de IA con estadísticas calculadas
        const enhancedSummary = {
            ...jsonResponse,
            // Sobrescribir con cálculos precisos
            calificacion_promedio: stats.averageRating || jsonResponse.calificacion_promedio,
            sentiment_general: stats.calculatedSentiment || jsonResponse.sentiment_general,
            // Agregar estadísticas adicionales
            estadisticas_detalladas: {
                total_calificaciones: stats.totalRatings,
                distribucion_calificaciones: stats.ratingDistribution,
                total_votos_utiles: stats.totalUtilVotes,
                comentarios_con_calificacion: stats.validCommentsCount,
                porcentaje_con_calificacion: stats.totalRatings > 0 ? 
                    Math.round((stats.totalRatings / comments.length) * 100) : 0
            }
        };

        // Devolver la respuesta
        return {
            success: true,
            data: {
                product_name: productName,
                total_comments_analyzed: comments.length,
                summary: enhancedSummary,
                analysis_timestamp: new Date().toISOString(),
                usage: respuesta.usage
            }
        };

    } catch (e) {
        console.error('Error summarizing comments:', e.message);
        if (e instanceof ZodError) {
            return { error: JSON.parse(e.message).map(error => error.message) };
        } else if (String(e.message).includes('[')) {
            return { error: JSON.parse(e.message) };
        } else {
            return { error: e.message };
        }
    }
};
