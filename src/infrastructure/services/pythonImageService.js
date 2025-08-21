import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PythonImageService {
    constructor() {
        // Ruta al script Python (versión segura para Windows)
        this.pythonScriptPath = path.join(__dirname, '../../../python_image_generator/generar_cli.py');

        // Usar Python del sistema (detección automática)
        this.pythonCommand = 'python'; // Se puede cambiar a 'python3' si es necesario

        // Directorio donde se guardan las imágenes (relativo al script Python)
        this.imageDirectory = path.join(__dirname, '../../../python_image_generator/imagenes_consumibles');
        this.metadataDirectory = path.join(__dirname, '../../../python_image_generator/metadata');
    }

    /**
     * Ejecuta el script de Python para generar imágenes
     * @param {Object} params - Parámetros para la generación de imágenes
     * @returns {Promise<Object>} Resultado de la generación
     */
    async generateImages(params) {
        const {
            productName,
            productDescription,
            style = 'profesional',
            variations = 3,
            width = 768,
            height = 768,
            inferenceSteps = 25,
            guidanceScale = 7.5
        } = params;

        // Construir argumentos para el script Python
        const args = [
            this.pythonScriptPath,
            '--producto', productName,
            '--descripcion', productDescription,
            '--estilo', style,
            '--variaciones', variations.toString(),
            '--width', width.toString(),
            '--height', height.toString(),
            '--pasos', inferenceSteps.toString(),
            '--guidance', guidanceScale.toString(),
            '--quiet' // Modo silencioso para mejor parsing del JSON
        ];

        console.log('🐍 Ejecutando script Python:', this.pythonCommand, args.join(' '));

        return new Promise((resolve, reject) => {
            let stdout = '';
            let stderr = '';

            // Spawn del proceso Python
            const pythonProcess = spawn(this.pythonCommand, args, {
                cwd: path.dirname(this.pythonScriptPath),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Capturar stdout (JSON response)
            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            // Capturar stderr (logs y errores)
            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
                console.log('Python stderr:', data.toString());
            });

            // Manejar errores del proceso
            pythonProcess.on('error', (error) => {
                console.error('❌ Error ejecutando Python:', error);
                reject({
                    success: false,
                    error: 'PythonExecutionError',
                    message: `Error ejecutando el script Python: ${error.message}`,
                    details: {
                        code: error.code,
                        path: error.path
                    }
                });
            });

            // Proceso completado
            pythonProcess.on('close', (code) => {
                console.log(`🐍 Proceso Python terminado con código: ${code}`);

                if (code !== 0) {
                    reject({
                        success: false,
                        error: 'PythonScriptError',
                        message: `El script Python terminó con código de error: ${code}`,
                        details: {
                            exitCode: code,
                            stderr: stderr,
                            stdout: stdout
                        }
                    });
                    return;
                }

                // Parsear la respuesta JSON
                try {
                    const result = JSON.parse(stdout);

                if (result.exito) {
                    // Procesar respuesta con imágenes base64
                    const processedResult = this.processImageResponse(result);
                    resolve(processedResult);
                } else {
                        reject({
                            success: false,
                            error: result.error || 'UnknownPythonError',
                            message: result.mensaje || 'Error desconocido en el script Python',
                            details: result
                        });
                    }
                } catch (parseError) {
                    console.error('❌ Error parseando JSON de Python:', parseError);
                    console.log('Raw stdout:', stdout);
                    reject({
                        success: false,
                        error: 'JSONParseError',
                        message: 'No se pudo parsear la respuesta del script Python',
                        details: {
                            parseError: parseError.message,
                            rawOutput: stdout,
                            stderr: stderr
                        }
                    });
                }
            });

            // Timeout de seguridad (5 minutos)
            setTimeout(() => {
                if (!pythonProcess.killed) {
                    console.log('⏰ Timeout: Terminando proceso Python...');
                    pythonProcess.kill('SIGTERM');
                    reject({
                        success: false,
                        error: 'TimeoutError',
                        message: 'La generación de imágenes tomó demasiado tiempo (timeout: 5 minutos)'
                    });
                }
            }, 5 * 60 * 1000); // 5 minutos
        });
    }

    /**
     * Procesa el resultado del script Python con soporte para imágenes base64
     * @param {Object} result - Resultado del script Python
     * @returns {Object} Resultado procesado
     */
    processImageResponse(result) {
        if (!result.datos || !result.datos.imagenes) {
            return result;
        }

        // Procesar cada imagen según su formato
        result.datos.imagenes = result.datos.imagenes.map(image => {
            if (image.formato === 'base64') {
                // Imagen en formato base64 - agregar data URL
                return {
                    ...image,
                    data_url: `data:${image.mime_type};base64,${image.base64_data}`,
                    // Mantener información útil para el frontend
                    display_ready: true,
                    size_mb: (image.metadata.tamano_bytes / (1024 * 1024)).toFixed(2)
                };
            } else {
                // Imagen en formato archivo - agregar URLs de servicio (compatibilidad)
                return {
                    ...image,
                    urls: {
                        serve: `/api/images/serve/${image.nombre_archivo}`,
                        download: `/api/images/download/${image.nombre_archivo}`,
                        metadata: `/api/images/metadata/${image.id}`
                    },
                    display_ready: false
                };
            }
        });

        return result;
    }

    /**
     * Verifica si Python está disponible
     * @returns {Promise<Object>} Estado de Python
     */
    async checkPythonAvailability() {
        return new Promise((resolve) => {
            const pythonProcess = spawn(this.pythonCommand, ['--version'], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.on('close', (code) => {
                resolve({
                    available: code === 0,
                    version: output.trim(),
                    command: this.pythonCommand
                });
            });

            pythonProcess.on('error', (error) => {
                resolve({
                    available: false,
                    error: error.message,
                    command: this.pythonCommand
                });
            });
        });
    }

    /**
     * Verifica si el script Python existe y es ejecutable
     * @returns {Promise<Boolean>}
     */
    async checkScriptExists() {
        try {
            await fs.access(this.pythonScriptPath, fs.constants.F_OK | fs.constants.R_OK);
            return true;
        } catch (error) {
            console.error('❌ Script Python no encontrado:', this.pythonScriptPath);
            return false;
        }
    }

    /**
     * Obtiene información sobre las dependencias Python
     * @returns {Promise<Object>} Info sobre las dependencias
     */
    async checkDependencies() {
        const requirementsPath = path.join(path.dirname(this.pythonScriptPath), 'requirements.txt');

        try {
            const requirements = await fs.readFile(requirementsPath, 'utf-8');
            const lines = requirements.split('\n').filter(line =>
                line.trim() && !line.startsWith('#') && !line.startsWith('-')
            );

            return {
                requirementsFound: true,
                requirementsPath: requirementsPath,
                dependencies: lines.map(line => line.trim()),
                installCommand: `pip install -r ${requirementsPath}`
            };
        } catch (error) {
            return {
                requirementsFound: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene el estado completo del servicio Python
     * @returns {Promise<Object>} Estado completo
     */
    async getServiceStatus() {
        const [pythonStatus, scriptExists, dependenciesInfo] = await Promise.all([
            this.checkPythonAvailability(),
            this.checkScriptExists(),
            this.checkDependencies()
        ]);

        return {
            python: pythonStatus,
            script: {
                exists: scriptExists,
                path: this.pythonScriptPath
            },
            dependencies: dependenciesInfo,
            directories: {
                images: this.imageDirectory,
                metadata: this.metadataDirectory
            },
            ready: pythonStatus.available && scriptExists && dependenciesInfo.requirementsFound
        };
    }
}

// Singleton instance
export const pythonImageService = new PythonImageService();
