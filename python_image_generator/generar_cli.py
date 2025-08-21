#!/usr/bin/env python3
"""
Script CLI para generar imágenes de productos consumibles
Diseñado para ser ejecutado desde Node.js y devolver JSON

Uso:
python generar_cli.py --producto "Chocolate Premium" --descripcion "Chocolate artesanal..." --estilo premium --variaciones 3

Retorna JSON con la metadata completa para Node.js
"""

import argparse
import json
import sys
import os
from pathlib import Path
import traceback
from datetime import datetime

# Configurar codificación para Windows
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

# Importar nuestro generador
try:
    from image_generator import GeneradorImagenesConsumibles
except ImportError as e:
    # Error de importación - devolver JSON con error
    error_response = {
        "exito": False,
        "error": "ImportError",
        "mensaje": f"No se pudo importar el generador: {str(e)}",
        "timestamp": datetime.now().isoformat()
    }
    print(json.dumps(error_response, ensure_ascii=False))
    sys.exit(1)

def validar_argumentos(args):
    """
    Valida los argumentos de entrada
    
    Args:
        args: Argumentos parseados
        
    Returns:
        dict: Diccionario con errores encontrados (vacío si todo OK)
    """
    errores = {}
    
    # Validaciones básicas
    if not args.producto or len(args.producto.strip()) == 0:
        errores["producto"] = "El nombre del producto es requerido y no puede estar vacío"
    
    if not args.descripcion or len(args.descripcion.strip()) == 0:
        errores["descripcion"] = "La descripción es requerida y no puede estar vacía"
    
    # Validar rango de valores numéricos
    if args.variaciones < 1 or args.variaciones > 20:
        errores["variaciones"] = "El número de variaciones debe estar entre 1 y 20"
    
    if args.width < 256 or args.width > 2048:
        errores["width"] = "El ancho debe estar entre 256 y 2048 píxeles"
        
    if args.height < 256 or args.height > 2048:
        errores["height"] = "El alto debe estar entre 256 y 2048 píxeles"
        
    if args.pasos < 10 or args.pasos > 100:
        errores["pasos"] = "Los pasos de inferencia deben estar entre 10 y 100"
        
    if args.guidance < 1.0 or args.guidance > 20.0:
        errores["guidance"] = "El guidance scale debe estar entre 1.0 y 20.0"
    
    return errores

def main():
    """Función principal del CLI"""
    
    # Configurar parser de argumentos
    parser = argparse.ArgumentParser(
        description="Generador de imágenes promocionales para productos consumibles",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:

  # Básico
  python generar_cli.py --producto "Chocolate Premium" --descripcion "Chocolate artesanal 70% cacao"
  
  # Con parámetros personalizados
  python generar_cli.py \\
    --producto "Bombones Trufa" \\
    --descripcion "Bombones artesanales con trufa belga" \\
    --estilo premium \\
    --variaciones 5 \\
    --width 1024 \\
    --height 768

  # Desde Node.js:
  const { exec } = require('child_process');
  exec('python generar_cli.py --producto "..." --descripcion "..."', (error, stdout) => {
    const resultado = JSON.parse(stdout);
  });

Estilos disponibles: profesional, artistico, minimalista, natural, premium, divertido, promocional, banner, catalogo, instagram, editorial, ecommerce
        """
    )
    
    # Argumentos requeridos
    parser.add_argument(
        '--producto', 
        type=str, 
        required=True,
        help='Nombre del producto (requerido)'
    )
    
    parser.add_argument(
        '--descripcion',
        type=str, 
        required=True,
        help='Descripción detallada del producto (requerido)'
    )
    
    # Argumentos opcionales
    parser.add_argument(
        '--estilo',
        type=str,
        default='profesional',
        choices=['profesional', 'artistico', 'minimalista', 'natural', 'premium', 'divertido', 'promocional', 'banner', 'catalogo', 'instagram', 'editorial', 'ecommerce'],
        help='Estilo de la imagen (default: profesional)'
    )
    
    parser.add_argument(
        '--variaciones',
        type=int,
        default=3,
        help='Número de variaciones a generar (default: 3, max: 20)'
    )
    
    parser.add_argument(
        '--width',
        type=int,
        default=768,
        help='Ancho de la imagen en píxeles (default: 768)'
    )
    
    parser.add_argument(
        '--height', 
        type=int,
        default=768,
        help='Alto de la imagen en píxeles (default: 768)'
    )
    
    parser.add_argument(
        '--pasos',
        type=int,
        default=25,
        help='Pasos de inferencia - más pasos = mejor calidad (default: 25)'
    )
    
    parser.add_argument(
        '--guidance',
        type=float,
        default=7.5,
        help='Guidance scale - adherencia al prompt (default: 7.5)'
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        default=None,
        help='Directorio personalizado para guardar imágenes'
    )
    
    parser.add_argument(
        '--quiet',
        action='store_true',
        help='Modo silencioso - solo output JSON'
    )
    
    parser.add_argument(
        '--base64',
        action='store_true',
        default=True,
        help='Devolver imágenes en base64 (default: True)'
    )
    
    parser.add_argument(
        '--save-files',
        action='store_true',
        help='Guardar archivos en disco en lugar de devolver base64'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='Generador de Imágenes CLI v1.0'
    )
    
    try:
        # Parsear argumentos
        args = parser.parse_args()
        
        # Validar argumentos
        errores = validar_argumentos(args)
        if errores:
            respuesta_error = {
                "exito": False,
                "error": "ValidationError",
                "mensaje": "Errores en los argumentos de entrada",
                "errores": errores,
                "timestamp": datetime.now().isoformat()
            }
            print(json.dumps(respuesta_error, ensure_ascii=False, indent=2 if not args.quiet else None))
            sys.exit(1)
        
        # Mostrar info de inicio si no está en modo quiet
        if not args.quiet:
            print(f"Iniciando generación de {args.variaciones} imágenes para: {args.producto}", file=sys.stderr)
            print(f"Estilo: {args.estilo}", file=sys.stderr)
            print("", file=sys.stderr)
        
        # Inicializar generador
        if not args.quiet:
            print("Inicializando generador de imágenes...", file=sys.stderr)
        
        # Crear una versión del generador que controle los emojis
        class GeneradorLimpio(GeneradorImagenesConsumibles):
            def __init__(self, *init_args, **init_kwargs):
                # Redirigir completamente la inicialización para evitar prints en stdout
                if args.quiet:
                    import contextlib
                    import io
                    f = io.StringIO()
                    with contextlib.redirect_stdout(f), contextlib.redirect_stderr(f):
                        super().__init__(*init_args, **init_kwargs)
                else:
                    # Capturar y redirigir a stderr
                    import contextlib
                    import io
                    
                    old_stdout = sys.stdout
                    stdout_buffer = io.StringIO()
                    
                    try:
                        sys.stdout = stdout_buffer
                        super().__init__(*init_args, **init_kwargs)
                        
                        # Todo lo capturado va a stderr
                        captured_output = stdout_buffer.getvalue().strip()
                        if captured_output:
                            print(captured_output, file=sys.stderr)
                            
                    finally:
                        sys.stdout = old_stdout
            
            def _detectar_dispositivo(self):
                if hasattr(self, '_device_cached'):
                    return self._device_cached
                
                import torch
                if torch.cuda.is_available():
                    self._device_cached = "cuda"
                    if not args.quiet:
                        gpu_name = torch.cuda.get_device_name(0)
                        print(f"GPU detectada: {gpu_name}", file=sys.stderr)
                        print(f"VRAM disponible: {torch.cuda.get_device_properties(0).total_memory // 1024**3} GB", file=sys.stderr)
                else:
                    self._device_cached = "cpu"
                    if not args.quiet:
                        print("GPU no disponible, usando CPU (sera mas lento)", file=sys.stderr)
                return self._device_cached
            
            def _cargar_pipeline(self):
                if not args.quiet:
                    print(f"Cargando modelo: {self.modelo_id}", file=sys.stderr)
                    print(f"Tipo: {'SDXL' if self.es_sdxl else 'SD 1.5/2.x'}", file=sys.stderr)
                    
                # Llamar al método padre pero redirigir prints
                import contextlib
                import io
                
                if args.quiet:
                    # Suprimir completamente los prints en modo quiet
                    f = io.StringIO()
                    with contextlib.redirect_stdout(f), contextlib.redirect_stderr(f):
                        super()._cargar_pipeline()
                else:
                    # Capturar y filtrar emojis
                    import re
                    from io import StringIO
                    
                    old_stdout = sys.stdout
                    old_stderr = sys.stderr
                    stdout_buffer = StringIO()
                    stderr_buffer = StringIO()
                    
                    try:
                        sys.stdout = stdout_buffer
                        sys.stderr = stderr_buffer
                        super()._cargar_pipeline()
                        
                        # Filtrar emojis y mostrar output limpio
                        stdout_content = stdout_buffer.getvalue()
                        stderr_content = stderr_buffer.getvalue()
                        
                        # Remover emojis usando regex
                        emoji_pattern = re.compile("["
                            u"\U0001F600-\U0001F64F"  # emoticons
                            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                            u"\U0001F680-\U0001F6FF"  # transport & map
                            u"\U0001F1E0-\U0001F1FF"  # flags
                            u"\U00002700-\U000027BF"  # dingbats
                            u"\U0001F900-\U0001F9FF"  # supplemental symbols
                            "]+", flags=re.UNICODE)
                        
                        clean_stdout = emoji_pattern.sub('', stdout_content).strip()
                        clean_stderr = emoji_pattern.sub('', stderr_content).strip()
                        
                        if clean_stdout:
                            print(clean_stdout, file=old_stderr)
                        if clean_stderr:
                            print(clean_stderr, file=old_stderr)
                            
                    finally:
                        sys.stdout = old_stdout
                        sys.stderr = old_stderr
            
            def generar_imagenes(self, *args_gen, **kwargs_gen):
                if args.quiet:
                    # Suprimir completamente los prints en modo quiet
                    import contextlib
                    import io
                    f = io.StringIO()
                    with contextlib.redirect_stdout(f), contextlib.redirect_stderr(f):
                        return super().generar_imagenes(*args_gen, **kwargs_gen)
                else:
                    # Capturar y filtrar emojis
                    import re
                    from io import StringIO
                    
                    old_stdout = sys.stdout
                    old_stderr = sys.stderr
                    stdout_buffer = StringIO()
                    stderr_buffer = StringIO()
                    
                    try:
                        sys.stdout = stdout_buffer
                        sys.stderr = stderr_buffer
                        result = super().generar_imagenes(*args_gen, **kwargs_gen)
                        
                        # Filtrar emojis
                        emoji_pattern = re.compile("["
                            u"\U0001F600-\U0001F64F"
                            u"\U0001F300-\U0001F5FF"
                            u"\U0001F680-\U0001F6FF"
                            u"\U0001F1E0-\U0001F1FF"
                            u"\U00002700-\U000027BF"
                            u"\U0001F900-\U0001F9FF"
                            "]+", flags=re.UNICODE)
                        
                        clean_stdout = emoji_pattern.sub('', stdout_buffer.getvalue()).strip()
                        clean_stderr = emoji_pattern.sub('', stderr_buffer.getvalue()).strip()
                        
                        if clean_stdout:
                            print(clean_stdout, file=old_stderr)
                        if clean_stderr:
                            print(clean_stderr, file=old_stderr)
                            
                        return result
                    finally:
                        sys.stdout = old_stdout
                        sys.stderr = old_stderr
            
            def limpiar_memoria(self):
                if args.quiet:
                    import contextlib
                    import io
                    f = io.StringIO()
                    with contextlib.redirect_stdout(f), contextlib.redirect_stderr(f):
                        return super().limpiar_memoria()
                else:
                    if self.device == "cuda":
                        import torch
                        torch.cuda.empty_cache()
                    import gc
                    gc.collect()
                    print("Memoria limpiada", file=sys.stderr)
        
        generador = GeneradorLimpio()
        
        if not args.quiet:
            print(f"Generador inicializado - Dispositivo: {generador.device}", file=sys.stderr)
            print("", file=sys.stderr)
        
        # Si se especificó directorio personalizado, actualizar
        if args.output_dir:
            generador.carpeta_imagenes = Path(args.output_dir)
            generador.carpeta_imagenes.mkdir(exist_ok=True, parents=True)
        
        # Generar imágenes
        # Determinar si usar base64 o archivos
        use_base64 = args.base64 and not args.save_files
        
        if not args.quiet:
            print(f"Modo: {'Base64' if use_base64 else 'Archivos'}", file=sys.stderr)
        
        resultado = generador.generar_imagenes(
            nombre_producto=args.producto,
            descripcion=args.descripcion,
            estilo=args.estilo,
            num_variaciones=args.variaciones,
            width=args.width,
            height=args.height,
            pasos_inferencia=args.pasos,
            guidance_scale=args.guidance,
            return_base64=use_base64
        )
        
        # Formatear respuesta para Node.js con rutas absolutas
        respuesta_final = {
            "exito": True,
            "mensaje": f"Se generaron {resultado['resultados']['exitosas']} de {args.variaciones} imágenes solicitadas",
            "timestamp": datetime.now().isoformat(),
            "datos": {
                "session_id": resultado['session_id'],
                "producto": {
                    "nombre": args.producto,
                    "descripcion": args.descripcion,
                    "tipo": "consumible"
                },
                "configuracion": {
                    "estilo": args.estilo,
                    "variaciones_solicitadas": args.variaciones,
                    "dimensiones": {"width": args.width, "height": args.height},
                    "pasos_inferencia": args.pasos,
                    "guidance_scale": args.guidance,
                    "dispositivo": generador.device
                },
                "estadisticas": {
                    "total_generadas": resultado['resultados']['exitosas'],
                    "total_fallidas": resultado['resultados']['fallidas'],
                    "tasa_exito": resultado['resultados']['tasa_exito']
                },
                "imagenes": [],
                "archivos": {
                    "directorio_imagenes": str(generador.carpeta_imagenes.absolute()),
                    "archivo_metadata": resultado.get('archivo_metadata', '')
                }
            }
        }
        
        # Procesar lista de imágenes generadas
        for img_info in resultado['imagenes']:
            if img_info.get('exito', False):
                if img_info.get('formato') == 'base64':
                    # Imagen en base64
                    imagen_data = {
                        "id": f"{resultado['session_id']}_{img_info['variacion']:02d}",
                        "variacion": img_info['variacion'],
                        "nombre_archivo": img_info['nombre_archivo'],
                        "base64_data": img_info['base64_data'],
                        "mime_type": img_info['mime_type'],
                        "formato": "base64",
                        "metadata": {
                            "hash_sha256": img_info['hash_sha256'],
                            "tamano_bytes": img_info['tamano_bytes'],
                            "dimensiones": img_info['dimensiones'],
                            "timestamp_generacion": img_info['timestamp_generacion']
                        }
                    }
                else:
                    # Imagen como archivo
                    imagen_data = {
                        "id": f"{resultado['session_id']}_{img_info['variacion']:02d}",
                        "variacion": img_info['variacion'],
                        "nombre_archivo": img_info['nombre_archivo'],
                        "ruta_absoluta": img_info['ruta_completa'],
                        "ruta_relativa": img_info['ruta_relativa'],
                        "url_file": f"file://{img_info['ruta_completa']}",  # Para acceso directo
                        "formato": "archivo",
                        "metadata": {
                            "hash_sha256": img_info['hash_sha256'],
                            "tamano_bytes": img_info.get('tamano_archivo', img_info.get('tamano_bytes', 0)),
                            "dimensiones": img_info['dimensiones'],
                            "timestamp_generacion": img_info['timestamp_generacion']
                        }
                    }
                respuesta_final['datos']['imagenes'].append(imagen_data)
        
        # Output del JSON resultado (esto es lo que captura Node.js)
        print(json.dumps(respuesta_final, ensure_ascii=False, indent=2 if not args.quiet else None))
        
        if not args.quiet:
            print(f"\nGeneración completada!", file=sys.stderr)
            print(f"Imágenes guardadas en: {generador.carpeta_imagenes.absolute()}", file=sys.stderr)
        
        # Limpiar memoria
        generador.limpiar_memoria()
        
    except KeyboardInterrupt:
        respuesta_interrupcion = {
            "exito": False,
            "error": "InterruptedError", 
            "mensaje": "Generación interrumpida por el usuario",
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(respuesta_interrupcion, ensure_ascii=False))
        sys.exit(1)
        
    except Exception as e:
        # Capturar cualquier error y devolverlo como JSON
        respuesta_error = {
            "exito": False,
            "error": type(e).__name__,
            "mensaje": str(e),
            "timestamp": datetime.now().isoformat(),
            "traceback": traceback.format_exc() if not args.quiet else None
        }
        print(json.dumps(respuesta_error, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()