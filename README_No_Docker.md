# 🚀 Guía de Instalación y Ejecución SIN Docker

Esta guía te ayudará a ejecutar el **Generador de Productos con IA** directamente en tu sistema Windows sin usar Docker.

## 📋 Requisitos Previos

### Software Necesario
- **Python 3.8+** (recomendado 3.9 o superior)
- **Node.js 22+** 
- **npm** (incluido con Node.js)
- **Git** (para clonar el repositorio)

### Hardware Recomendado
- **16GB RAM mínimo** para modelos de IA (8GB puede funcionar con CPU)
- **GPU NVIDIA opcional** (RTX series recomendada para generación rápida)
- **15-20GB espacio libre** (para modelos de IA)

### Verificar Instalaciones

```powershell
# Verificar Python
python --version
# Debe mostrar: Python 3.8.x o superior

# Verificar Node.js
node --version
# Debe mostrar: v22.x.x o superior

# Verificar npm
npm --version

# Verificar Git
git --version
```

## 🔧 PASO 1: Configuración del Generador de Imágenes Python

### 1.1: Navegar a la carpeta del generador

```powershell
# Clonar el repositorio si aún no lo has hecho
git clone <url-del-repositorio>
cd ollama_python_node_docker

# Navegar a la carpeta del generador de imágenes
cd python_image_generator
```

### 1.2: Ejecutar el instalador automático

```powershell
# Ejecutar el instalador que detecta GPU/CPU automáticamente
python install.py
```

**¿Qué hace el instalador?**
- ✅ Detecta automáticamente si tienes GPU NVIDIA
- ✅ Instala PyTorch con CUDA (GPU) o CPU según tu hardware
- ✅ Instala diffusers, transformers y todas las dependencias de IA
- ✅ Verifica que todo esté funcionando correctamente

### 1.3: Pre-descargar modelos de Stable Diffusion

Después de la instalación exitosa, necesitas pre-descargar los modelos de IA. Crea y ejecuta este script:

```powershell
# Crear script de descarga de modelos
@"
#!/usr/bin/env python3
import os
import sys
from diffusers import StableDiffusionPipeline, StableDiffusionXLPipeline
import torch

print("=== DESCARGANDO MODELOS DE STABLE DIFFUSION ===")

# Detectar dispositivo
device = "cuda" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if device == "cuda" else torch.float32

print(f"Dispositivo detectado: {device}")

# Directorio cache personalizado
cache_dir = "./modelos"
os.makedirs(cache_dir, exist_ok=True)

print(f"Descargando modelos en: {os.path.abspath(cache_dir)}")

# Lista de modelos a descargar
modelos = [
    {"id": "runwayml/stable-diffusion-v1-5", "tipo": "SD 1.5", "pipeline": StableDiffusionPipeline},
    {"id": "stabilityai/stable-diffusion-xl-base-1.0", "tipo": "SDXL", "pipeline": StableDiffusionXLPipeline}
]

for modelo in modelos:
    try:
        print(f"\n🔄 Descargando {modelo['tipo']}: {modelo['id']}")
        
        # Pre-descargar modelo
        pipeline = modelo['pipeline'].from_pretrained(
            modelo['id'],
            torch_dtype=torch_dtype,
            cache_dir=cache_dir,
            safety_checker=None,
            requires_safety_checker=False,
            use_safetensors=True
        )
        
        print(f"✅ {modelo['tipo']} descargado exitosamente")
        
        # Limpiar memoria
        del pipeline
        if device == "cuda":
            torch.cuda.empty_cache()
            
    except Exception as e:
        print(f"❌ Error descargando {modelo['tipo']}: {str(e)}")
        
        # Si SDXL falla, continuar con SD 1.5
        if "xl" in modelo['id'].lower():
            print("⚠️  SDXL requiere más memoria. SD 1.5 funcionará como fallback.")
            continue
        else:
            raise

print("\n🎉 Descarga de modelos completada")
print("💡 Los modelos están guardados en:", os.path.abspath(cache_dir))
"@ | Out-File -FilePath "descargar_modelos.py" -Encoding UTF8

# Ejecutar el script de descarga
python descargar_modelos.py
```

**⏰ Tiempo estimado de descarga:**
- **Con internet rápido**: 10-20 minutos
- **Con internet lento**: 30-60 minutos
- **Tamaño total**: ~8-15 GB

### 1.4: Verificar instalación del generador

```powershell
# Probar que todo funciona
python generar_cli.py --producto "Manzana Roja" --descripcion "Una manzana fresca y jugosa" --variaciones 1 --quiet

# Si todo está bien, deberías ver un JSON con información de la imagen generada
```

## 🔧 PASO 2: Configurar e instalar Ollama (Modelos de Texto)

### 2.1: Instalar Ollama

**Opción A: Instalación directa en Windows**

```powershell
# Descargar desde https://ollama.com/download/windows
# O usar winget:
winget install Ollama.Ollama
```

**Opción B: Usar Docker solo para Ollama**

```powershell
# Si prefieres usar Docker solo para Ollama
docker run -d -p 11434:11434 --name ollama_service `
    -v ollama_data:/root/.ollama `
    ollama/ollama:latest
```

### 2.2: Ejecutar Ollama y descargar modelo

```powershell
# Iniciar Ollama (si instalaste directamente)
ollama serve

# En otra terminal PowerShell, descargar el modelo
ollama pull gemma3:1b

# Verificar que funciona
ollama list
```

## 🔧 PASO 3: Configurar Backend Node.js

```powershell
# Volver a la carpeta raíz del proyecto
cd ..

# Instalar dependencias del backend
npm install

# Verificar que se instaló correctamente
npm list express
```

## 🔧 PASO 4: Configurar Frontend React

```powershell
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias del frontend
npm install

# Verificar instalación
npm list react

# Volver a la carpeta raíz
cd ..
```

## 🔧 PASO 5: Configuración de Variables de Entorno (Opcional)

```powershell
# Crear archivo .env en la carpeta raíz
@"
# Backend
NODE_ENV=development
API_PORT=3000

# Ollama
OLLAMA_URL=http://localhost:11434
MODEL_NAME=gemma3:1b

# Python Service (interno)
PYTHON_SERVICE_URL=http://localhost:8000
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

## 🚀 EJECUCIÓN DE LA APLICACIÓN

### Orden de Ejecución Recomendado

Necesitas **3 terminales de PowerShell**:

### Terminal 1: Backend Node.js

```powershell
# En la carpeta raíz del proyecto
cd C:\ruta\a\tu\proyecto\ollama_python_node_docker

# Ejecutar backend en modo desarrollo
npm run dev

# ✅ Deberías ver: "Conectado al servidor mediante el puerto: 3000"
```

### Terminal 2: Frontend React

```powershell
# Navegar a frontend  
cd C:\ruta\a\tu\proyecto\ollama_python_node_docker\frontend

# Ejecutar frontend
npm run dev

# ✅ Deberías ver: "Local: http://localhost:5173/"
```

### Terminal 3: Ollama (si no está ejecutándose)

```powershell
# Solo si instalaste Ollama directamente
ollama serve

# ✅ Deberías ver: "Ollama server running on http://localhost:11434"
```

## ✅ VERIFICACIÓN DE LA INSTALACIÓN

### Verificar servicios individualmente

```powershell
# 1. Verificar que Ollama responde
curl http://localhost:11434/api/version

# 2. Verificar que el backend responde  
curl http://localhost:3000/api/images/service/status

# 3. Abrir frontend en navegador
start http://localhost:5173
```

### Prueba completa de la aplicación

1. **Abrir navegador**: http://localhost:5173
2. **Ir a "Descripciones"**: Generar descripción de producto
3. **Ir a "Imágenes"**: Generar imagen de producto (puede tardar 2-5 minutos)
4. **Ir a "Comentarios"**: Generar comentarios de cliente

## 🔍 DIAGNÓSTICO Y SOLUCIÓN DE PROBLEMAS

### Problema: "Error cargando modelo en Python"

```powershell
cd python_image_generator

# Verificar PyTorch
python -c "import torch; print('PyTorch OK:', torch.__version__)"

# Verificar CUDA (si tienes GPU)
python -c "import torch; print('CUDA:', torch.cuda.is_available())"

# Verificar Diffusers
python -c "import diffusers; print('Diffusers OK:', diffusers.__version__)"

# Re-descargar modelos si faltan
python descargar_modelos.py
```

### Problema: "Puerto ocupado"

```powershell
# Ver qué usa el puerto 3000
netstat -ano | findstr :3000

# Cambiar puerto en .env
echo "API_PORT=3001" >> .env
```

### Problema: "Ollama connection refused"

```powershell
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/version

# Si no responde, reiniciar Ollama
ollama serve

# Verificar modelo instalado
ollama list
```

### Problema: "Out of Memory" en generación de imágenes

Edita `python_image_generator/generar_cli.py`:

```python
# Cambiar dimensiones por defecto (líneas ~140-150)
parser.add_argument('--width', default=512)    # Era 768
parser.add_argument('--height', default=512)   # Era 768
```

### Problema: Frontend no conecta con Backend

```powershell
cd frontend

# Verificar configuración del API
cat vite.config.js

# Debe tener proxy configurado, si no crear/editar:
@"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
"@ | Out-File -FilePath "vite.config.js" -Encoding UTF8
```

## 📊 MONITOREO DE RECURSOS

### Ver uso de GPU (si tienes NVIDIA)

```powershell
# Monitorear GPU cada 2 segundos
while ($true) { nvidia-smi; Start-Sleep 2; Clear-Host }
```

### Ver uso de memoria y CPU

```powershell
# Monitorear procesos Python y Node
Get-Process python,node | Select Name,CPU,WorkingSet
```

## 🚀 OPTIMIZACIÓN PARA DIFERENTES HARDWARE

### Para GPU NVIDIA (8GB+ VRAM)

- Usa dimensiones 768x768 o superiores
- Mantén SDXL habilitado
- Aumenta pasos de inferencia para mejor calidad

### Para GPU NVIDIA (4-6GB VRAM)

- Usa dimensiones 512x512 
- Prefiere SD 1.5 sobre SDXL
- Reduce pasos de inferencia a 20-25

### Para CPU solamente

```powershell
# Editar python_image_generator/generar_cli.py
# Cambiar valores por defecto:
# - width: 512
# - height: 512  
# - pasos: 20
# - variaciones: 1-2 máximo
```

## 📋 RESUMEN DE COMANDOS RÁPIDOS

```powershell
# INSTALACIÓN COMPLETA
cd python_image_generator
python install.py
python descargar_modelos.py
cd ..
npm install
cd frontend && npm install && cd ..
ollama serve
ollama pull gemma3:1b

# EJECUCIÓN DIARIA
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: Ollama (si es necesario)
ollama serve

# VERIFICACIÓN RÁPIDA
curl http://localhost:11434/api/version
curl http://localhost:3000/api/images/service/status
start http://localhost:5173
```

## 🎉 ¡LISTO!

Si seguiste todos los pasos correctamente:

- ✅ **Backend**: http://localhost:3000
- ✅ **Frontend**: http://localhost:5173  
- ✅ **Ollama**: http://localhost:11434
- ✅ **Modelos de IA**: Pre-descargados y listos
- ✅ **Generación de contenido**: Funcionando completamente

**¡Ahora puedes generar descripciones, imágenes y comentarios de productos usando IA!** 🎨🤖
