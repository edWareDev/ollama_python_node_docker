import { z } from "zod";

// Schema para generar comentarios
export const generateCommentsSchema = z.object({
    productName: z.string()
        .min(2, "El nombre del producto debe tener al menos 2 caracteres")
        .max(200, "El nombre del producto no puede exceder 200 caracteres")
        .trim(),
    
    productDescription: z.string()
        .min(10, "La descripción del producto debe tener al menos 10 caracteres")
        .max(1000, "La descripción del producto no puede exceder 1000 caracteres")
        .trim(),
    
    numberOfComments: z.number()
        .int("El número de comentarios debe ser un número entero")
        .min(1, "Debe generar al menos 1 comentario")
        .max(20, "No se pueden generar más de 20 comentarios por solicitud")
        .default(5),
    
    sentiment: z.enum(["positive", "negative", "mixed"], {
        errorMap: () => ({ message: "El sentimiento debe ser 'positive', 'negative' o 'mixed'" })
    }).default("mixed")
});

// Schema para resumir comentarios
export const summarizeCommentsSchema = z.object({
    productName: z.string()
        .min(2, "El nombre del producto debe tener al menos 2 caracteres")
        .max(200, "El nombre del producto no puede exceder 200 caracteres")
        .trim(),
    
    comments: z.array(
        z.union([
            z.string().min(1, "Los comentarios como texto no pueden estar vacíos"),
            z.object({
                usuario: z.string().optional(),
                calificacion: z.union([z.number(), z.string()]).optional(),
                comentario: z.string().optional(),
                comment: z.string().optional(), // Alternativa para diferentes formatos
                texto: z.string().optional(),   // Alternativa para diferentes formatos
                fecha_relativa: z.string().optional(),
                util: z.union([z.number(), z.string()]).optional()
            })
        ])
    ).min(1, "Debe proporcionar al menos un comentario")
     .max(100, "No se pueden analizar más de 100 comentarios por solicitud")
});
