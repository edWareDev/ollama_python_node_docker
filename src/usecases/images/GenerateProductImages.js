import { ZodError } from "zod";
import { generateImageSchema } from "../../adapters/web/validators/imageValidators.js";
import { pythonImageService } from "../../infrastructure/services/pythonImageService.js";

export const generateProductImages = async (data) => {
    try {
        console.log('🖼️ Iniciando generación de imágenes...');
        console.log('📊 Datos recibidos:', data);

        // Validate input data
        const validationResult = generateImageSchema.safeParse(data);
        
        if (!validationResult.success) {
            return { 
                success: false,
                error: 'ValidationError',
                message: 'Errores de validación en los datos de entrada',
                details: validationResult.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            };
        }

        const validatedData = validationResult.data;
        console.log('✅ Datos validados:', validatedData);

        // Check if Python service is ready
        const serviceStatus = await pythonImageService.getServiceStatus();
        console.log('🔍 Estado del servicio Python:', serviceStatus);

        if (!serviceStatus.ready) {
            const missingComponents = [];
            
            if (!serviceStatus.python.available) {
                missingComponents.push(`Python no disponible: ${serviceStatus.python.error || 'Comando no encontrado'}`);
            }
            
            if (!serviceStatus.script.exists) {
                missingComponents.push(`Script Python no encontrado: ${serviceStatus.script.path}`);
            }
            
            if (!serviceStatus.dependencies.requirementsFound) {
                missingComponents.push('Archivo requirements.txt no encontrado');
            }

            return {
                success: false,
                error: 'ServiceNotReady',
                message: 'El servicio de generación de imágenes no está listo',
                details: {
                    missingComponents,
                    serviceStatus,
                    suggestions: [
                        'Verificar que Python esté instalado y en el PATH',
                        'Verificar que el script generar_cli.py exista',
                        'Instalar dependencias: pip install -r requirements.txt'
                    ]
                }
            };
        }

        console.log('🚀 Servicio Python listo, ejecutando generación...');

        // Execute Python script
        const imageGenerationResult = await pythonImageService.generateImages({
            productName: validatedData.productName,
            productDescription: validatedData.productDescription,
            style: validatedData.style,
            variations: validatedData.variations,
            width: validatedData.width,
            height: validatedData.height,
            inferenceSteps: validatedData.inferenceSteps,
            guidanceScale: validatedData.guidanceScale
        });

        console.log('✅ Generación completada exitosamente');

        // Return structured response
        return {
            success: true,
            message: `Se generaron ${imageGenerationResult.datos.estadisticas.total_generadas} imágenes exitosamente`,
            data: {
                session_id: imageGenerationResult.datos.session_id,
                product: {
                    name: validatedData.productName,
                    description: validatedData.productDescription,
                    type: 'consumible'
                },
                generation_config: {
                    style: validatedData.style,
                    variations_requested: validatedData.variations,
                    dimensions: {
                        width: validatedData.width,
                        height: validatedData.height
                    },
                    inference_steps: validatedData.inferenceSteps,
                    guidance_scale: validatedData.guidanceScale,
                    device: imageGenerationResult.datos.configuracion.dispositivo
                },
                statistics: {
                    total_generated: imageGenerationResult.datos.estadisticas.total_generadas,
                    total_failed: imageGenerationResult.datos.estadisticas.total_fallidas,
                    success_rate: imageGenerationResult.datos.estadisticas.tasa_exito
                },
                images: imageGenerationResult.datos.imagenes.map(img => ({
                    id: img.id,
                    variation: img.variacion,
                    filename: img.nombre_archivo,
                    format: img.formato,
                    // Si es base64, incluir la data URL lista para usar
                    ...(img.formato === 'base64' ? {
                        data_url: img.data_url,
                        mime_type: img.mime_type,
                        display_ready: img.display_ready,
                        size_mb: img.size_mb
                    } : {
                        // Si es archivo, incluir las URLs de servicio
                        urls: img.urls,
                        display_ready: img.display_ready
                    }),
                    metadata: {
                        hash: img.metadata.hash_sha256,
                        size_bytes: img.metadata.tamano_bytes,
                        dimensions: img.metadata.dimensiones,
                        timestamp: img.metadata.timestamp_generacion
                    }
                })),
                metadata: {
                    generation_timestamp: imageGenerationResult.timestamp,
                    images_directory: imageGenerationResult.datos.archivos.directorio_imagenes,
                    metadata_file: imageGenerationResult.datos.archivos.archivo_metadata,
                    // Indicar si las imágenes vienen en base64
                    format: imageGenerationResult.datos.imagenes.length > 0 ? 
                        imageGenerationResult.datos.imagenes[0].formato : 'unknown'
                }
            }
        };

    } catch (error) {
        console.error('❌ Error en generación de imágenes:', error);
        
        // Handle specific error types
        if (error instanceof ZodError) {
            return {
                success: false,
                error: 'ValidationError',
                message: 'Error de validación',
                details: JSON.parse(error.message).map(err => err.message)
            };
        }

        // Handle Python service errors
        if (error.error && error.message) {
            return {
                success: false,
                error: error.error,
                message: error.message,
                details: error.details
            };
        }

        // Handle unexpected errors
        return {
            success: false,
            error: 'UnexpectedError',
            message: 'Error inesperado durante la generación de imágenes',
            details: {
                errorMessage: error.message,
                errorStack: error.stack
            }
        };
    }
};

// Additional helper function to get available styles
export const getAvailableStyles = () => {
    return {
        success: true,
        data: {
            styles: [
                {
                    id: 'profesional',
                    name: 'Profesional',
                    description: 'Fotografía profesional de productos con iluminación de estudio'
                },
                {
                    id: 'artistico',
                    name: 'Artístico',
                    description: 'Composición artística y creativa con iluminación dramática'
                },
                {
                    id: 'minimalista',
                    name: 'Minimalista',
                    description: 'Composición simple y limpia con fondo blanco'
                },
                {
                    id: 'natural',
                    name: 'Natural',
                    description: 'Fotografía natural con iluminación suave y materiales rústicos'
                },
                {
                    id: 'premium',
                    name: 'Premium',
                    description: 'Presentación elegante y lujosa para productos de alta gama'
                },
                {
                    id: 'divertido',
                    name: 'Divertido',
                    description: 'Colores vibrantes y presentación alegre, atractiva para niños'
                }
            ],
            default_style: 'profesional'
        }
    };
};

// Function to check service status
export const checkImageGenerationService = async () => {
    try {
        const status = await pythonImageService.getServiceStatus();
        
        return {
            success: true,
            data: {
                service_ready: status.ready,
                python: status.python,
                script: status.script,
                dependencies: status.dependencies,
                directories: status.directories,
                recommendations: status.ready ? 
                    ['El servicio está listo para generar imágenes'] :
                    [
                        'Instalar Python si no está disponible',
                        'Verificar que el script generar_cli.py exista',
                        `Instalar dependencias: ${status.dependencies.installCommand || 'pip install -r requirements.txt'}`
                    ]
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'ServiceCheckError',
            message: 'Error verificando el estado del servicio',
            details: error.message
        };
    }
};
