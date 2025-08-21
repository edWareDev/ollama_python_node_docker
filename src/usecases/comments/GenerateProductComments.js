import { ZodError } from "zod";
import { generateCommentsSchema } from "../../adapters/web/validators/commentValidators.js";
import { OpenAiClient } from "../../infraestructure/services/openAIService.js";
import { ollamaConfig } from "../../../config/ollama.js";
import { parseJSONByIA } from "../../utils/parseIJSONGeneratedByIa.js";

export const generateProductComments = async (data) => {
    try {
        // Validar información de entrada
        const validationResult = generateCommentsSchema.safeParse(data);

        if (!validationResult.success) {
            return { error: validationResult.error.issues.map(issue => issue.message) };
        }

        const { productName, productDescription, numberOfComments = 5, sentiment = "mixed" } = validationResult.data;

        const SYSTEM_PROMPT = 'Eres experto en generar comentarios realistas de clientes sobre productos. Debes responder ÚNICAMENTE con un array JSON válido de comentarios. Cada objeto debe tener las claves "usuario", "calificacion", "comentario", "fecha_relativa", y "util". No incluyas texto adicional, markdown, ni explicaciones. Solo el JSON.';

        const sentimentInstructions = {
            positive: "Genera comentarios mayormente positivos (4-5 estrellas) con experiencias satisfactorias",
            negative: "Genera comentarios mayormente negativos (1-2 estrellas) con críticas constructivas",
            mixed: "Genera una mezcla realista de comentarios positivos, neutros y algunos negativos"
        };

        const USER_PROMPT = `Genera ${numberOfComments} comentarios de clientes para el producto: "${productName}". Descripción: "${productDescription}". ${sentimentInstructions[sentiment]}. Los comentarios deben ser variados, naturales y específicos del producto. Incluye nombres de usuario realistas, calificaciones del 1 al 5, fechas relativas como "hace 2 días", "hace 1 semana", etc., y un número de personas que encontraron el comentario útil.`;

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
            temperature: 0.8
        });

        // Obtener la respuesta directa de IA
        const rawContent = respuesta.choices[0].message.content.trim();

        // Convertir a Objeto JSON
        const jsonResponse = parseJSONByIA(rawContent);

        // Devolver la respuesta
        return {
            success: true,
            data: {
                product_name: productName,
                product_description: productDescription,
                comments: jsonResponse,
                sentiment_type: sentiment,
                total_comments: jsonResponse.length,
                usage: respuesta.usage
            }
        };

    } catch (e) {
        console.error('Error generating product comments:', e.message);
        if (e instanceof ZodError) {
            return { error: JSON.parse(e.message).map(error => error.message) };
        } else if (String(e.message).includes('[')) {
            return { error: JSON.parse(e.message) };
        } else {
            return { error: e.message };
        }
    }
};
