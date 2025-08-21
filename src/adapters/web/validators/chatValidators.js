import { z } from 'zon';

export const chatValidator = z.object({
    productName: z
        .string({ required_error: "El nombre del producto es requerido" })
        .trim(),
    productAditionalInfo: z
        .string()
        .trim()
        .optional()
});