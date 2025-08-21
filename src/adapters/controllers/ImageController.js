import { generateProductImages, getAvailableStyles, checkImageGenerationService } from "../../usecases/images/GenerateProductImages.js";
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controller para generar imágenes de productos
 */
export async function controllerGenerateProductImages(req, res) {
    try {
        const data = req.body;
        console.log("🖼️ ~ controllerGenerateProductImages ~ data:", data);

        const result = await generateProductImages(data);
        
        // Check if there was an error in the response
        if (!result.success) {
            const statusCode = result.error === 'ValidationError' ? 400 : 
                             result.error === 'ServiceNotReady' ? 503 : 500;
            return res.status(statusCode).json({ 
                success: false,
                error: result.error,
                message: result.message,
                details: result.details 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: result.message,
            data: result.data 
        });
        
    } catch (error) {
        console.error('Controller error:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'InternalServerError',
            message: 'Error interno del servidor' 
        });
    }
}

/**
 * Controller para obtener estilos disponibles
 */
export async function controllerGetAvailableStyles(req, res) {
    try {
        const result = getAvailableStyles();
        res.status(200).json(result);
        
    } catch (error) {
        console.error('Error getting available styles:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'InternalServerError',
            message: 'Error obteniendo estilos disponibles' 
        });
    }
}

/**
 * Controller para verificar estado del servicio de generación de imágenes
 */
export async function controllerCheckImageGenerationService(req, res) {
    try {
        const result = await checkImageGenerationService();
        
        const statusCode = result.success && result.data.service_ready ? 200 : 503;
        res.status(statusCode).json(result);
        
    } catch (error) {
        console.error('Error checking image service:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'InternalServerError',
            message: 'Error verificando el servicio' 
        });
    }
}

/**
 * Controller para servir imágenes generadas
 */
export async function controllerServeImage(req, res) {
    try {
        const { filename } = req.params;
        
        // Construir ruta a la imagen
        const imageDirectory = path.join(__dirname, '../../../python_image_generator/imagenes_consumibles');
        const imagePath = path.join(imageDirectory, filename);
        
        console.log('📂 Sirviendo imagen:', imagePath);
        
        // Verificar que el archivo existe
        try {
            await fs.access(imagePath, fs.constants.F_OK);
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: 'ImageNotFound',
                message: 'La imagen solicitada no fue encontrada',
                details: { filename, path: imagePath }
            });
        }
        
        // Verificar que el archivo está dentro del directorio permitido (seguridad)
        const resolvedImagePath = path.resolve(imagePath);
        const resolvedImageDirectory = path.resolve(imageDirectory);
        
        if (!resolvedImagePath.startsWith(resolvedImageDirectory)) {
            return res.status(403).json({
                success: false,
                error: 'AccessDenied',
                message: 'Acceso denegado al archivo solicitado'
            });
        }
        
        // Determinar tipo MIME basado en extensión
        const extension = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const mimeType = mimeTypes[extension] || 'application/octet-stream';
        
        // Configurar headers para caching
        res.set({
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
            'ETag': `"${filename}"`,
            'Accept-Ranges': 'bytes'
        });
        
        // Servir el archivo
        res.sendFile(resolvedImagePath, (error) => {
            if (error) {
                console.error('Error serving image:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'FileServerError',
                        message: 'Error sirviendo la imagen'
                    });
                }
            }
        });
        
    } catch (error) {
        console.error('Controller error serving image:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false,
                error: 'InternalServerError',
                message: 'Error interno sirviendo la imagen' 
            });
        }
    }
}

/**
 * Controller para descargar imagen
 */
export async function controllerDownloadImage(req, res) {
    try {
        const { filename } = req.params;
        
        // Construir ruta a la imagen
        const imageDirectory = path.join(__dirname, '../../../python_image_generator/imagenes_consumibles');
        const imagePath = path.join(imageDirectory, filename);
        
        console.log('⬇️ Descargando imagen:', imagePath);
        
        // Verificar que el archivo existe
        try {
            await fs.access(imagePath, fs.constants.F_OK);
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: 'ImageNotFound',
                message: 'La imagen solicitada no fue encontrada'
            });
        }
        
        // Verificar seguridad del path
        const resolvedImagePath = path.resolve(imagePath);
        const resolvedImageDirectory = path.resolve(imageDirectory);
        
        if (!resolvedImagePath.startsWith(resolvedImageDirectory)) {
            return res.status(403).json({
                success: false,
                error: 'AccessDenied',
                message: 'Acceso denegado al archivo solicitado'
            });
        }
        
        // Configurar headers para descarga
        res.set({
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'application/octet-stream'
        });
        
        // Descargar el archivo
        res.download(resolvedImagePath, filename, (error) => {
            if (error) {
                console.error('Error downloading image:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'DownloadError',
                        message: 'Error descargando la imagen'
                    });
                }
            }
        });
        
    } catch (error) {
        console.error('Controller error downloading image:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false,
                error: 'InternalServerError',
                message: 'Error interno descargando la imagen' 
            });
        }
    }
}

/**
 * Controller para obtener metadata de imagen
 */
export async function controllerGetImageMetadata(req, res) {
    try {
        const { imageId } = req.params;
        
        // Extraer session_id del imageId (formato: sessionId_XX)
        const sessionId = imageId.split('_')[0];
        
        if (!sessionId || sessionId.length !== 8) {
            return res.status(400).json({
                success: false,
                error: 'InvalidImageId',
                message: 'ID de imagen inválido'
            });
        }
        
        // Buscar archivo de metadata
        const metadataDirectory = path.join(__dirname, '../../../python_image_generator/metadata');
        const metadataPath = path.join(metadataDirectory, `sesion_${sessionId}.json`);
        
        try {
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);
            
            // Buscar la imagen específica
            const imageMetadata = metadata.imagenes.find(img => 
                `${sessionId}_${img.variacion.toString().padStart(2, '0')}` === imageId
            );
            
            if (!imageMetadata) {
                return res.status(404).json({
                    success: false,
                    error: 'ImageMetadataNotFound',
                    message: 'Metadata de la imagen no encontrada'
                });
            }
            
            res.status(200).json({
                success: true,
                data: {
                    image_id: imageId,
                    session_id: sessionId,
                    product: metadata.producto,
                    generation_config: metadata.parametros,
                    image_details: imageMetadata,
                    generation_timestamp: metadata.timestamp
                }
            });
            
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: 'MetadataNotFound',
                message: 'Archivo de metadata no encontrado',
                details: { sessionId, metadataPath }
            });
        }
        
    } catch (error) {
        console.error('Error getting image metadata:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'InternalServerError',
            message: 'Error obteniendo metadata de la imagen' 
        });
    }
}

/**
 * Controller para listar todas las imágenes generadas
 */
export async function controllerListGeneratedImages(req, res) {
    try {
        const { page = 1, limit = 10, sessionId } = req.query;
        
        const metadataDirectory = path.join(__dirname, '../../../python_image_generator/metadata');
        
        // Leer todos los archivos de metadata
        const files = await fs.readdir(metadataDirectory);
        const sessionFiles = files.filter(file => 
            file.startsWith('sesion_') && file.endsWith('.json')
        );
        
        let allImages = [];
        
        for (const file of sessionFiles) {
            try {
                const metadataPath = path.join(metadataDirectory, file);
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                const metadata = JSON.parse(metadataContent);
                
                // Filtrar por sessionId si se proporciona
                if (sessionId && metadata.session_id !== sessionId) {
                    continue;
                }
                
                // Agregar imágenes exitosas
                const successfulImages = metadata.imagenes
                    .filter(img => img.exito)
                    .map(img => ({
                        id: `${metadata.session_id}_${img.variacion.toString().padStart(2, '0')}`,
                        session_id: metadata.session_id,
                        product_name: metadata.producto.nombre,
                        variation: img.variacion,
                        filename: img.nombre_archivo,
                        generation_timestamp: img.timestamp_generacion,
                        style: metadata.parametros.estilo,
                        dimensions: img.dimensiones,
                        file_size: img.tamano_archivo,
                        urls: {
                            serve: `/api/images/serve/${img.nombre_archivo}`,
                            download: `/api/images/download/${img.nombre_archivo}`,
                            metadata: `/api/images/metadata/${metadata.session_id}_${img.variacion.toString().padStart(2, '0')}`
                        }
                    }));
                
                allImages.push(...successfulImages);
                
            } catch (error) {
                console.warn(`Error reading metadata file ${file}:`, error.message);
            }
        }
        
        // Ordenar por timestamp de generación (más reciente primero)
        allImages.sort((a, b) => new Date(b.generation_timestamp) - new Date(a.generation_timestamp));
        
        // Paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedImages = allImages.slice(startIndex, endIndex);
        
        res.status(200).json({
            success: true,
            data: {
                images: paginatedImages,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total_items: allImages.length,
                    total_pages: Math.ceil(allImages.length / limit),
                    has_next: endIndex < allImages.length,
                    has_prev: startIndex > 0
                },
                filters: {
                    session_id: sessionId || null
                }
            }
        });
        
    } catch (error) {
        console.error('Error listing generated images:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'InternalServerError',
            message: 'Error listando las imágenes generadas' 
        });
    }
}
