import { ZodError } from "zod/v4";
import { createProductInfoSchema } from "../../adapters/web/validators/chatValidators.js";
import { OpenAiClient } from "../../infraestructure/services/openAIService.js";
import { ollamaConfig } from "../../../config/ollama.js";
import { parseJSONByIA } from "../../utils/parseIJSONGeneratedByIa.js";

export const generateProductInfo = async (data) => {

    try {
        // Validar información de entrada
        const validationResult = createProductInfoSchema.safeParse(data);

        if (!validationResult.success) {
            return { error: validationResult.error.issues.map(issue => issue.message) };
        }

        const { productName, productAditionalInfo } = validationResult.data;

        const SYSTEM_PROMPT = 'Eres experto en marketing de productos. Debes responder ÚNICAMENTE con un array JSON válido de 5 propuestas. Cada objeto debe tener las claves "titulo" y "descripcion_comercial". No incluyas texto adicional, markdown, ni explicaciones. Solo el JSON.';

        //La informacion adicional debe de tener por lo menos 5 carácteres para que sea tomada en cuenta
        const USER_PROMPT = `Genera 3 títulos comerciales atractivos y sus descripciones para el producto: ${productName}${String(productAditionalInfo).trim().length > 5 ? `. Información adicional: ${productAditionalInfo}` : ''}`;


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
            temperature: 0.7
        });


        // Obtener la respuesta directa de IA
        const rawContent = respuesta.choices[0].message.content.trim();

        // Convertir a Objeto JSON
        const jsonResponse = parseJSONByIA(rawContent);

        // Devolver la respuesta
        return {
            success: true,
            data: {
                proposals: jsonResponse,
                usage: respuesta.usage
            }
        };

    } catch (e) {
        console.error(e.message);
        if (e instanceof ZodError) {
            return { error: JSON.parse(e.message).map(error => error.message) };
        } else if (String(e.message).includes('[')) {
            return { error: JSON.parse(e.message).map(error => error) };
        } else {
            return { error: e.message };
        }
    }
};