import os
import torch
import json
from datetime import datetime
from PIL import Image
import hashlib
from pathlib import Path
from diffusers import StableDiffusionPipeline, StableDiffusionXLPipeline, DPMSolverMultistepScheduler
import gc

class GeneradorImagenesConsumibles:
    def __init__(self, modelo="runwayml/stable-diffusion-v1-5", cache_dir="./modelos"):
        """
        Inicializa el generador de imágenes promocionales para productos consumibles
        
        Args:
            modelo (str): Modelo de Stable Diffusion a usar
            cache_dir (str): Directorio donde guardar los modelos descargados
        """
        self.modelo_id = modelo
        self.cache_dir = cache_dir
        self.device = self._detectar_dispositivo()
        self.pipeline = None
        self.es_sdxl = "xl" in modelo.lower()
        
        # Modelos recomendados para diferentes tipos de contenido
        self.modelos_recomendados = {
            "promocional": "stabilityai/stable-diffusion-xl-base-1.0",  # SDXL para calidad y composición
            "realista": "runwayml/stable-diffusion-v1-5",              # SD 1.5 para realismo básico
            "artistico": "stabilityai/stable-diffusion-2-1",            # SD 2.1 para arte
        }
        
        # Crear directorios necesarios
        self.carpeta_imagenes = Path("imagenes_consumibles")
        self.carpeta_imagenes.mkdir(exist_ok=True)
        self.carpeta_metadata = Path("metadata")
        self.carpeta_metadata.mkdir(exist_ok=True)
        
        # Cargar el pipeline
        self._cargar_pipeline()
        
        print(f"Generador inicializado usando: {self.device}")

    def _detectar_dispositivo(self):
        """
        Detecta automáticamente si usar GPU o CPU
        
        Returns:
            str: 'cuda' si hay GPU disponible, 'cpu' en caso contrario
        """
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            print(f"GPU detectada: {gpu_name}")
            print(f"VRAM disponible: {torch.cuda.get_device_properties(0).total_memory // 1024**3} GB")
            return "cuda"
        else:
            print("GPU no disponible, usando CPU (sera mas lento)")
            return "cpu"

    def _cargar_pipeline(self):
        """
        Carga el pipeline de Stable Diffusion optimizado para el dispositivo disponible
        """
        print(f"Cargando modelo: {self.modelo_id}")
        print(f"Tipo: {'SDXL' if self.es_sdxl else 'SD 1.5/2.x'}")
        
        try:
            # Seleccionar clase de pipeline según el modelo
            pipeline_class = StableDiffusionXLPipeline if self.es_sdxl else StableDiffusionPipeline
            
            # Configurar según dispositivo disponible
            if self.device == "cuda":
                print("Configurando para GPU...")
                # Configuración básica y estable para GPU
                self.pipeline = pipeline_class.from_pretrained(
                    self.modelo_id,
                    torch_dtype=torch.float16,  # Usar float16 para ahorrar VRAM
                    cache_dir=self.cache_dir,
                    safety_checker=None,
                    requires_safety_checker=False,
                    use_safetensors=True
                )
                
                # Mover a GPU
                self.pipeline = self.pipeline.to(self.device)
                
                # Aplicar optimizaciones según el tipo de modelo
                try:
                    self.pipeline.enable_attention_slicing()
                    print("Attention slicing habilitado")
                except Exception as e:
                    print(f"WARNING: Attention slicing no disponible: {e}")
                
                # Memory efficient attention
                try:
                    if hasattr(self.pipeline, 'enable_memory_efficient_attention'):
                        self.pipeline.enable_memory_efficient_attention()
                        print("Memory efficient attention habilitado")
                except Exception:
                    pass
                
                # CPU offloading para modelos grandes como SDXL
                if self.es_sdxl:
                    try:
                        self.pipeline.enable_model_cpu_offload()
                        print("Model CPU offloading habilitado")
                    except Exception:
                        pass
                
            else:
                print("Configurando para CPU...")
                # Configuración para CPU
                self.pipeline = pipeline_class.from_pretrained(
                    self.modelo_id,
                    torch_dtype=torch.float32,  # CPU requiere float32
                    cache_dir=self.cache_dir,
                    safety_checker=None,
                    requires_safety_checker=False,
                    use_safetensors=True
                )
                self.pipeline = self.pipeline.to(self.device)
            
            print("Modelo cargado exitosamente")
            
        except Exception as e:
            print(f"ERROR: Error cargando el modelo: {str(e)}")
            print("Intentando cargar modelo por defecto (SD 1.5)...")
            
            # Fallback a SD 1.5 si falla SDXL
            try:
                self.modelo_id = "runwayml/stable-diffusion-v1-5"
                self.es_sdxl = False
                
                if self.device == "cuda":
                    self.pipeline = StableDiffusionPipeline.from_pretrained(
                        self.modelo_id,
                        torch_dtype=torch.float16,
                        cache_dir=self.cache_dir,
                        safety_checker=None,
                        requires_safety_checker=False
                    )
                    self.pipeline = self.pipeline.to(self.device)
                else:
                    self.pipeline = StableDiffusionPipeline.from_pretrained(
                        self.modelo_id,
                        torch_dtype=torch.float32,
                        cache_dir=self.cache_dir,
                        safety_checker=None,
                        requires_safety_checker=False
                    )
                    self.pipeline = self.pipeline.to(self.device)
                
                print("Modelo SD 1.5 cargado como fallback")
                
            except Exception as fallback_error:
                print(f"ERROR CRITICO: Error cargando fallback: {str(fallback_error)}")
                raise

    def _construir_prompt_promocional(self, nombre_producto, descripcion, estilo="promocional"):
        """
        Construye prompts optimizados para imágenes promocionales de marketing
        
        Args:
            nombre_producto (str): Nombre del producto
            descripcion (str): Descripción del producto  
            estilo (str): Estilo de imagen promocional deseado
            
        Returns:
            tuple: (prompt_positivo, prompt_negativo)
        """
        # Estilos promocionales con configuración específica
        estilos_promocionales = {
            "promocional": "advertising photo, commercial product photography, studio lighting",
            "banner": "social media banner, web advertisement, marketing visual", 
            "catalogo": "catalog photography, retail product photo, clean background, commercial style",
            "instagram": "Instagram post, social media content, trendy photography",
            "editorial": "magazine photography, editorial style, artistic composition",
            "ecommerce": "e-commerce photo, white background, product listing, clean presentation",
            "premium": "luxury product photography, premium brand, elegant presentation",
            "natural": "natural product photography, organic style, soft lighting",
            "profesional": "professional product photography, studio lighting, commercial quality",
            "artistico": "artistic product photography, creative composition, dramatic lighting",
            "minimalista": "minimalist product photography, clean composition, simple background",
            "divertido": "playful product photography, vibrant colors, fun presentation"
        }
        
        # Usar 'promocional' como fallback si el estilo no existe
        estilo_config = estilos_promocionales.get(estilo.lower(), estilos_promocionales["promocional"])
        
        # Construir prompt más detallado y específico
        # Priorizar la descripción del producto para mayor fidelidad
        prompt_positivo = f"{descripcion}, {nombre_producto}, {estilo_config}, professional photography, high quality, sharp focus, detailed, realistic".strip()
        
        # Construir prompt positivo más específico y detallado
        # Enfatizar características específicas del producto
        prompt_detallado = f"{nombre_producto}, {descripcion}"
        
        # Añadir términos que refuercen las características específicas
        if "blanco" in nombre_producto.lower() or "white" in nombre_producto.lower():
            prompt_detallado += ", white color, creamy white texture, pale appearance"
        elif "oscuro" in nombre_producto.lower() or "dark" in nombre_producto.lower() or "negro" in nombre_producto.lower():
            prompt_detallado += ", dark brown color, rich chocolate appearance, deep cocoa color"
        elif "leche" in nombre_producto.lower() or "milk" in nombre_producto.lower():
            prompt_detallado += ", milk chocolate color, light brown appearance, creamy texture"
            
        # Reconstruir el prompt completo
        prompt_positivo = f"{prompt_detallado}, {estilo_config}, professional photography, high quality, sharp focus, detailed, realistic, accurate colors".strip()
        
        # Prompt negativo general (sin filtros específicos)
        prompt_negativo = "blurry, low quality, distorted, ugly, bad composition, poor lighting, unprofessional, pixelated, cartoon, anime, drawing, watermark, wrong colors, inaccurate appearance, multiple items, duplicate, deformed, unrealistic"
        
        return prompt_positivo, prompt_negativo
    
    # Mantener compatibilidad con el método anterior
    def _construir_prompt_consumible(self, nombre_producto, descripcion, estilo="promocional"):
        """
        Método de compatibilidad que redirige al nuevo método promocional
        """
        return self._construir_prompt_promocional(nombre_producto, descripcion, estilo)

    def generar_imagenes(self, nombre_producto, descripcion, estilo="profesional", 
                        num_variaciones=3, width=768, height=768, 
                        pasos_inferencia=25, guidance_scale=7.5):
        """
        Genera múltiples imágenes del producto consumible
        
        Args:
            nombre_producto (str): Nombre del producto
            descripcion (str): Descripción detallada
            estilo (str): Estilo de fotografía
            num_variaciones (int): Número de imágenes a generar
            width (int): Ancho de imagen
            height (int): Alto de imagen
            pasos_inferencia (int): Pasos de diffusión (más = mejor calidad)
            guidance_scale (float): Adherencia al prompt (7-15 recomendado)
            
        Returns:
            dict: Metadata completa de las imágenes generadas
        """
        print(f"Generando {num_variaciones} imágenes de: {nombre_producto}")
        print(f"Estilo: {estilo}")
        
        # Construir prompts
        prompt_pos, prompt_neg = self._construir_prompt_consumible(
            nombre_producto, descripcion, estilo
        )
        
        print(f"Prompt: {prompt_pos[:100]}...")
        
        # Generar ID único para esta sesión
        session_id = hashlib.md5(
            f"{nombre_producto}_{datetime.now().isoformat()}".encode()
        ).hexdigest()[:8]
        
        # Metadata de la sesión
        metadata_sesion = {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "producto": {
                "nombre": nombre_producto,
                "descripcion": descripcion,
                "tipo": "consumible"
            },
            "parametros": {
                "estilo": estilo,
                "num_variaciones": num_variaciones,
                "dimensiones": {"width": width, "height": height},
                "pasos_inferencia": pasos_inferencia,
                "guidance_scale": guidance_scale
            },
            "prompts": {
                "positivo": prompt_pos,
                "negativo": prompt_neg
            },
            "dispositivo": self.device,
            "imagenes": []
        }
        
        # Generar imágenes
        imagenes_exitosas = 0
        
        for i in range(num_variaciones):
            try:
                print(f"Generando variación {i+1}/{num_variaciones}...")
                
                # Generar imagen usando el pipeline
                with torch.autocast(self.device if self.device == "cuda" else "cpu"):
                    result = self.pipeline(
                        prompt=prompt_pos,
                        negative_prompt=prompt_neg,
                        width=width,
                        height=height,
                        num_inference_steps=pasos_inferencia,
                        guidance_scale=guidance_scale,
                        num_images_per_prompt=1
                    )
                    imagen = result.images[0]
                    
                    # Verificar si la imagen tiene valores válidos
                    import numpy as np
                    img_array = np.array(imagen)
                    if np.isnan(img_array).any() or np.isinf(img_array).any():
                        print(f"WARNING: Imagen {i+1} contiene valores NaN/Inf, regenerando con parámetros más conservadores...")
                        
                        # Intentar regenerar con parámetros más conservadores
                        result = self.pipeline(
                            prompt=f"{nombre_producto}, {descripcion}, photography",
                            negative_prompt="blurry, low quality",
                            width=512,
                            height=512,
                            num_inference_steps=10,
                            guidance_scale=2.0,
                            num_images_per_prompt=1
                        )
                        imagen = result.images[0]
                
                # Crear nombre de archivo único
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                nombre_archivo = f"{nombre_producto.replace(' ', '_')}_{estilo}_{session_id}_{i+1:02d}.png"
                ruta_archivo = self.carpeta_imagenes / nombre_archivo
                
                # Guardar imagen
                imagen.save(ruta_archivo, "PNG", quality=95)
                
                # Calcular hash de la imagen para verificación
                with open(ruta_archivo, 'rb') as f:
                    hash_imagen = hashlib.sha256(f.read()).hexdigest()[:16]
                
                # Metadata de la imagen individual
                metadata_imagen = {
                    "variacion": i + 1,
                    "nombre_archivo": nombre_archivo,
                    "ruta_completa": str(ruta_archivo.absolute()),
                    "ruta_relativa": str(ruta_archivo),
                    "tamano_archivo": ruta_archivo.stat().st_size,
                    "hash_sha256": hash_imagen,
                    "dimensiones": {"width": width, "height": height},
                    "timestamp_generacion": datetime.now().isoformat(),
                    "exito": True
                }
                
                metadata_sesion["imagenes"].append(metadata_imagen)
                imagenes_exitosas += 1
                
                print(f"Imagen {i+1} guardada: {nombre_archivo}")
                
                # Limpiar memoria GPU si es necesario
                if self.device == "cuda":
                    torch.cuda.empty_cache()
                    
            except Exception as e:
                print(f"ERROR: Error generando imagen {i+1}: {str(e)}")
                
                # Agregar error a metadata
                metadata_error = {
                    "variacion": i + 1,
                    "error": str(e),
                    "timestamp_error": datetime.now().isoformat(),
                    "exito": False
                }
                metadata_sesion["imagenes"].append(metadata_error)
        
        # Estadísticas finales
        metadata_sesion["resultados"] = {
            "total_solicitadas": num_variaciones,
            "exitosas": imagenes_exitosas,
            "fallidas": num_variaciones - imagenes_exitosas,
            "tasa_exito": (imagenes_exitosas / num_variaciones) * 100
        }
        
        # Guardar metadata en archivo JSON
        archivo_metadata = self.carpeta_metadata / f"sesion_{session_id}.json"
        with open(archivo_metadata, 'w', encoding='utf-8') as f:
            json.dump(metadata_sesion, f, indent=2, ensure_ascii=False)
        
        metadata_sesion["archivo_metadata"] = str(archivo_metadata.absolute())
        
        print(f"Generación completada: {imagenes_exitosas}/{num_variaciones} exitosas")
        print(f"Metadata guardada en: {archivo_metadata}")
        
        return metadata_sesion

    def generar_lote_productos(self, lista_productos):
        """
        Genera imágenes para múltiples productos
        
        Args:
            lista_productos (list): Lista de diccionarios con parámetros para cada producto
            
        Returns:
            dict: Resultados consolidados de todos los productos
        """
        print(f"Iniciando lote de {len(lista_productos)} productos")
        
        resultados_lote = {
            "timestamp_inicio": datetime.now().isoformat(),
            "total_productos": len(lista_productos),
            "productos": [],
            "estadisticas_globales": {
                "productos_exitosos": 0,
                "total_imagenes_generadas": 0,
                "total_imagenes_fallidas": 0
            }
        }
        
        for i, producto in enumerate(lista_productos, 1):
            print(f"\n--- Procesando producto {i}/{len(lista_productos)}: {producto.get('nombre', 'Sin nombre')} ---")
            
            try:
                resultado = self.generar_imagenes(
                    nombre_producto=producto['nombre'],
                    descripcion=producto['descripcion'],
                    estilo=producto.get('estilo', 'profesional'),
                    num_variaciones=producto.get('num_variaciones', 3),
                    width=producto.get('width', 768),
                    height=producto.get('height', 768),
                    pasos_inferencia=producto.get('pasos_inferencia', 25),
                    guidance_scale=producto.get('guidance_scale', 7.5)
                )
                
                resultados_lote["productos"].append(resultado)
                
                # Actualizar estadísticas
                if resultado["resultados"]["exitosas"] > 0:
                    resultados_lote["estadisticas_globales"]["productos_exitosos"] += 1
                
                resultados_lote["estadisticas_globales"]["total_imagenes_generadas"] += resultado["resultados"]["exitosas"]
                resultados_lote["estadisticas_globales"]["total_imagenes_fallidas"] += resultado["resultados"]["fallidas"]
                
            except Exception as e:
                print(f"ERROR: Error procesando {producto.get('nombre', 'producto')}: {str(e)}")
                
                error_info = {
                    "producto": producto,
                    "error": str(e),
                    "timestamp_error": datetime.now().isoformat(),
                    "exito": False
                }
                resultados_lote["productos"].append(error_info)
        
        # Finalizar metadata del lote
        resultados_lote["timestamp_fin"] = datetime.now().isoformat()
        
        # Guardar resultados del lote
        timestamp_lote = datetime.now().strftime("%Y%m%d_%H%M%S")
        archivo_lote = self.carpeta_metadata / f"lote_{timestamp_lote}.json"
        
        with open(archivo_lote, 'w', encoding='utf-8') as f:
            json.dump(resultados_lote, f, indent=2, ensure_ascii=False)
        
        resultados_lote["archivo_metadata_lote"] = str(archivo_lote.absolute())
        
        print(f"\nLOTE COMPLETADO:")
        print(f"   Productos exitosos: {resultados_lote['estadisticas_globales']['productos_exitosos']}/{len(lista_productos)}")
        print(f"   Total imágenes: {resultados_lote['estadisticas_globales']['total_imagenes_generadas']}")
        print(f"   Metadata del lote: {archivo_lote}")
        
        return resultados_lote

    def limpiar_memoria(self):
        """
        Libera memoria GPU/CPU manualmente
        """
        if self.device == "cuda":
            torch.cuda.empty_cache()
        gc.collect()
        print("Memoria limpiada")

    def obtener_estilos_disponibles(self):
        """
        Retorna lista de estilos promocionales disponibles
        
        Returns:
            list: Lista de estilos promocionales que se pueden usar
        """
        return [
            "promocional",   # Diseño publicitario general
            "banner",        # Banners web y redes sociales
            "catalogo",      # Fotografía para catálogos
            "instagram",     # Contenido para Instagram
            "editorial",     # Estilo editorial/revista
            "ecommerce",     # E-commerce/tienda online
            "premium",       # Marca premium/lujo
            "natural"        # Marketing orgánico/natural
        ]
    
    def mostrar_info_gpu(self):
        """
        Muestra información detallada de la GPU y optimizaciones activas
        """
        if self.device == "cuda":
            print("\nINFORMACIÓN DE GPU:")
            print(f"   - Nombre: {torch.cuda.get_device_name(0)}")
            print(f"   - VRAM Total: {torch.cuda.get_device_properties(0).total_memory // 1024**3} GB")
            print(f"   - VRAM Usada: {torch.cuda.memory_allocated() // 1024**2} MB")
            print(f"   - VRAM Libre: {(torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_allocated()) // 1024**2} MB")
            print(f"   - Compute Capability: {torch.cuda.get_device_properties(0).major}.{torch.cuda.get_device_properties(0).minor}")
            print(f"   - Multiprocessors: {torch.cuda.get_device_properties(0).multi_processor_count}")
            print("\nOPTIMIZACIONES ACTIVAS:")
            print("   - PyTorch CUDA habilitado")
            print("   - Float16 precision (ahorra VRAM)")
            print("   - Attention slicing")
            print("   - Memory efficient attention")
            print("   - Model CPU offloading")
            print("   - Automatic VRAM cleanup")
            print("   - UNet compilation desactivada (requiere Triton)")
        else:
            print("\nMODO CPU:")
            print("   - Sin aceleración GPU")
            print("   - Float32 precision")


def main():
    """
    Función principal de demostración
    """
    try:
        # Inicializar generador
        generador = GeneradorImagenesConsumibles()
        
        print(f"Estilos disponibles: {', '.join(generador.obtener_estilos_disponibles())}")
        
        # Ejemplo 1: Producto individual
        print("\n=== EJEMPLO 1: Chocolate Premium ===")
        resultado = generador.generar_imagenes(
            nombre_producto="Chocolate Artesanal 70% Cacao",
            descripcion="Tableta de chocolate oscuro artesanal con 70% cacao, textura suave y sabor intenso",
            estilo="premium",
            num_variaciones=4,
            width=768,
            height=768,
            pasos_inferencia=30
        )
        
        # Mostrar información del resultado
        print(f"Resultado: {resultado['resultados']['exitosas']} imágenes generadas")
        print(f"Session ID: {resultado['session_id']}")
        
        # Ejemplo 2: Lote de productos dulces
        print("\n=== EJEMPLO 2: Lote de Dulces ===")
        productos_dulces = [
            {
                "nombre": "Gominolas Frutas del Bosque",
                "descripcion": "Gominolas suaves con sabores naturales de frutas del bosque, sin gluten",
                "estilo": "divertido",
                "num_variaciones": 3,
                "pasos_inferencia": 25
            },
            {
                "nombre": "Snack de Nueces Caramelizadas",
                "descripcion": "Mix de nueces caramelizadas con miel, presentación premium en packaging elegante",
                "estilo": "natural",
                "num_variaciones": 2,
                "width": 768,
                "height": 512
            },
            {
                "nombre": "Bombones Trufa Francesa",
                "descripcion": "Bombones de trufa francesa con cobertura de cacao en polvo, sabor intenso",
                "estilo": "artistico", 
                "num_variaciones": 3,
                "guidance_scale": 8.0
            }
        ]
        
        resultado_lote = generador.generar_lote_productos(productos_dulces)
        
        print(f"\nRESUMEN FINAL:")
        print(f"Total productos procesados: {resultado_lote['total_productos']}")
        print(f"Imágenes totales generadas: {resultado_lote['estadisticas_globales']['total_imagenes_generadas']}")
        
        # Limpiar memoria al final
        generador.limpiar_memoria()
        
    except Exception as e:
        print(f"ERROR en main: {str(e)}")


if __name__ == "__main__":
    main()