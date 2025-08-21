import { ZodError } from "zod/v4";
import { createProductInfoSchema } from "../../adapters/web/validators/chatValidators.js";
import { OpenAiClient } from "../../infraestructure/services/openAIService.js";
import { ollamaConfig } from "../../../config/ollama.js";

export const generateProductInfo = async (data) => {

    try {
        const { productName, productAditionalInfo } = createProductInfoSchema.safeParse(data);

        const SYSTEM_PROMPT = 'Eres experto en marketing de productos';
        const USER_PROMPT = `Genema un título comercial muy atractivo para el producto ${productName} ${productAditionalInfo && `Además incluye esta información: ${productAditionalInfo}`}`;

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
            ]
        });

        console.log(respuesta);

    } catch (e) {
        if (e instanceof ZodError) {
            return { error: JSON.parse(e.message).map(error => error.message) };
        } else if (String(e.message).includes('[')) {
            return { error: JSON.parse(e.message).map(error => error) };
        } else {
            return { error: e.message };
        }
    }
};