import { z } from 'zod';

const availableStyles = [
    'profesional', 'artistico', 'minimalista', 'natural', 'premium', 'divertido',
    'promocional', 'banner', 'catalogo', 'instagram', 'editorial', 'ecommerce'
];

export const generateImageSchema = z.object({
    productName: z
        .string({ required_error: "El nombre del producto es requerido" })
        .trim()
        .min(1, { message: "El nombre del producto no puede estar vacío" })
        .max(100, { message: "El nombre del producto no puede exceder 100 caracteres" }),

    productDescription: z
        .string({ required_error: "La descripción del producto es requerida" })
        .trim()
        .min(10, { message: "La descripción debe tener al menos 10 caracteres" })
        .max(500, { message: "La descripción no puede exceder 500 caracteres" }),

    style: z
        .string()
        .default('profesional')
        .optional()
        .refine(val => !val || availableStyles.includes(val), {
            message: `El estilo debe ser uno de: ${availableStyles.join(', ')}`
        }),

    variations: z
        .number()
        .int()
        .min(1, { message: "Debe generar al menos 1 variación" })
        .max(10, { message: "No se pueden generar más de 10 variaciones por solicitud" })
        .default(3)
        .optional(),

    width: z
        .number()
        .int()
        .min(256, { message: "El ancho mínimo es 256 píxeles" })
        .max(2048, { message: "El ancho máximo es 2048 píxeles" })
        .default(768)
        .optional(),

    height: z
        .number()
        .int()
        .min(256, { message: "El alto mínimo es 256 píxeles" })
        .max(2048, { message: "El alto máximo es 2048 píxeles" })
        .default(768)
        .optional(),

    inferenceSteps: z
        .number()
        .int()
        .min(10, { message: "Mínimo 10 pasos de inferencia" })
        .max(100, { message: "Máximo 100 pasos de inferencia" })
        .default(25)
        .optional(),

    guidanceScale: z
        .number()
        .min(1.0, { message: "El guidance scale mínimo es 1.0" })
        .max(20.0, { message: "El guidance scale máximo es 20.0" })
        .default(7.5)
        .optional()
});

// Schema simple para validar parámetros de consulta de imágenes
export const imageQuerySchema = z.object({
    sessionId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
});

// Funciones helper para validación
export const getAvailableStyles = () => availableStyles;

export const validateImageRequest = (data) => {
    const result = generateImageSchema.safeParse(data);
    if (!result.success) {
        return {
            isValid: false,
            errors: result.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        };
    }
    return {
        isValid: true,
        data: result.data
    };
};
