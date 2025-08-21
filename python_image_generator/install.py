#!/usr/bin/env python3
"""
Script de instalación automática para el Generador de Imágenes con IA

Este script detecta automáticamente si hay GPU/CUDA disponible y instala
las dependencias correctas para PyTorch y las bibliotecas de IA.
"""

import subprocess
import sys
import platform
import os

def run_command(command, description=""):
    """Ejecuta un comando y maneja errores"""
    print(f"[PROCESO] {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"[OK] {description} completado")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Error en {description}:")
        print(f"   Comando: {command}")
        print(f"   Error: {e.stderr}")
        return False

def check_nvidia_gpu():
    """Verifica si hay GPU NVIDIA disponible"""
    try:
        result = subprocess.run("nvidia-smi", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("[GPU] GPU NVIDIA detectada")
            return True
    except:
        pass
    
    print("[CPU] No se detectó GPU NVIDIA")
    return False

def install_pytorch(has_gpu=False):
    """Instala PyTorch según disponibilidad de GPU"""
    if has_gpu:
        print("[INSTALL] Instalando PyTorch con soporte CUDA...")
        pytorch_command = "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121"
    else:
        print("[INSTALL] Instalando PyTorch para CPU...")
        pytorch_command = "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu"
    
    return run_command(pytorch_command, "Instalación de PyTorch")

def install_requirements():
    """Instala el resto de dependencias"""
    command = "pip install diffusers>=0.35.0 transformers>=4.55.0 accelerate>=1.10.0 Pillow>=11.0.0 numpy>=2.1.0 safetensors>=0.6.0 huggingface_hub>=0.34.0 requests>=2.32.0 tqdm>=4.67.0 packaging>=25.0 psutil>=7.0.0 pyyaml>=6.0.2"
    return run_command(command, "Instalación de dependencias de IA")

def verify_installation():
    """Verifica que la instalación sea correcta"""
    print("[VERIFY] Verificando instalación...")
    
    try:
        import torch
        print(f"   [OK] PyTorch {torch.__version__} instalado")
        
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            print(f"   [OK] CUDA disponible - GPU: {gpu_name}")
        else:
            print("   [INFO] CUDA no disponible - usando CPU")
            
        import diffusers
        print(f"   [OK] Diffusers {diffusers.__version__} instalado")
        
        import transformers
        print(f"   [OK] Transformers {transformers.__version__} instalado")
        
        print("\n[SUCCESS] Instalación completada exitosamente!")
        return True
        
    except ImportError as e:
        print(f"   [ERROR] Error de importación: {e}")
        return False

def main():
    print("=" * 70)
    print("INSTALADOR AUTOMATICO - GENERADOR DE IMAGENES CON IA")
    print("=" * 70)
    
    # Detectar sistema operativo
    system = platform.system()
    print(f"[SYSTEM] Sistema detectado: {system}")
    
    # Verificar Python
    python_version = sys.version_info
    print(f"[PYTHON] Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 8):
        print("[ERROR] Se requiere Python 3.8 o superior")
        return False
    
    # Actualizar pip
    print("\n[PASO 1] Actualizando pip...")
    run_command("pip install --upgrade pip", "Actualización de pip")
    
    # Detectar GPU
    print("\n[PASO 2] Detectando hardware...")
    has_gpu = check_nvidia_gpu()
    
    # Instalar PyTorch
    print(f"\n[PASO 3] Instalando PyTorch...")
    if not install_pytorch(has_gpu):
        print("[ERROR] Error instalando PyTorch. Verifica tu conexión a internet.")
        return False
    
    # Instalar dependencias
    print("\n[PASO 4] Instalando dependencias de IA...")
    if not install_requirements():
        print("[ERROR] Error instalando dependencias.")
        return False
    
    # Verificar instalación
    print("\n[PASO 5] Verificando instalación...")
    if verify_installation():
        print("\n[SUCCESS] INSTALACION COMPLETADA")
        print("\nPuedes probar el generador con:")
        print("python generar_cli.py --producto \"Manzana roja\" --descripcion \"Una manzana fresca\"")
        return True
    else:
        print("\n[ERROR] La verificación falló. Revisa los errores anteriores.")
        return False

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n[CANCEL] Instalación cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Error inesperado: {e}")
        sys.exit(1)
