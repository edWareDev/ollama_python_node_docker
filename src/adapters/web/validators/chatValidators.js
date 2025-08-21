import { z } from 'zod';

export const createProductInfoSchema = z.object({
    productName: z
        .string({ required_error: "El nombre del producto es requerido" })
        .trim(),
    productAditionalInfo: z
        .string()
        .trim()
        .optional()
});