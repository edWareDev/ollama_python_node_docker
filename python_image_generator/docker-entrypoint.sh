#!/bin/bash
# =============================================================================
# Docker Entrypoint para Generador de Imágenes con IA
# Maneja la inicialización del contenedor y detección automática de hardware
# =============================================================================

set -e

# Colores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[ENTRYPOINT]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner de inicio
echo "=============================================================================="
echo "       🎨 GENERADOR DE IMAGENES CON IA - DOCKER CONTAINER"
echo "=============================================================================="
echo ""

# Verificar Python y dependencias básicas
log "Verificando Python..."
python --version
if [ $? -ne 0 ]; then
    log_error "Python no encontrado"
    exit 1
fi

# Crear directorios necesarios si no existen
log "Creando directorios..."
mkdir -p /app/imagenes_consumibles
mkdir -p /app/metadata  
mkdir -p /app/modelos
mkdir -p /data/models
mkdir -p /data/output

# Verificar permisos de escritura
log "Verificando permisos..."
if [ ! -w /app/imagenes_consumibles ]; then
    log_warning "Sin permisos de escritura en /app/imagenes_consumibles"
fi

# Detectar hardware disponible y instalar PyTorch correcto
log "Detectando hardware..."
if command -v nvidia-smi &> /dev/null && nvidia-smi &> /dev/null; then
    log "GPU NVIDIA detectada, instalando PyTorch con CUDA..."
    pip install --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    export CUDA_AVAILABLE=true
    export DEVICE_TYPE="cuda"
    log_success "PyTorch con CUDA instalado"
else
    log_warning "GPU NVIDIA no detectada - usando CPU"
    export CUDA_AVAILABLE=false
    export DEVICE_TYPE="cpu"
    log_success "Usando PyTorch CPU"
fi

# Verificar PyTorch y CUDA
log "Verificando PyTorch..."
python -c "
import torch
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA disponible: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU detectada: {torch.cuda.get_device_name(0)}')
    print(f'VRAM total: {torch.cuda.get_device_properties(0).total_memory // 1024**3} GB')
else:
    print('Ejecutando en modo CPU')
" 2>/dev/null

if [ $? -eq 0 ]; then
    log_success "PyTorch configurado correctamente"
else
    log_error "Error con PyTorch - verificar instalación"
    exit 1
fi

# Verificar Diffusers
log "Verificando Diffusers..."
python -c "import diffusers; print(f'Diffusers version: {diffusers.__version__}')" 2>/dev/null
if [ $? -eq 0 ]; then
    log_success "Diffusers disponible"
else
    log_error "Error con Diffusers - verificar instalación"
    exit 1
fi

# Configurar cache de modelos
log "Configurando cache de modelos..."
export TORCH_HOME="/app/modelos/torch"
export HF_HOME="/app/modelos/huggingface" 
export TRANSFORMERS_CACHE="/app/modelos/transformers"
export DIFFUSERS_CACHE="/app/modelos/diffusers"

# Crear directorios de cache
mkdir -p "$TORCH_HOME"
mkdir -p "$HF_HOME"
mkdir -p "$TRANSFORMERS_CACHE"
mkdir -p "$DIFFUSERS_CACHE"

# Optimizaciones según hardware
if [ "$DEVICE_TYPE" = "cuda" ]; then
    log "Aplicando optimizaciones para GPU..."
    export CUDA_LAUNCH_BLOCKING=0
    export CUDA_CACHE_DISABLE=0
    export PYTORCH_CUDA_ALLOC_CONF="max_split_size_mb:512"
else
    log "Aplicando optimizaciones para CPU..."
    export OMP_NUM_THREADS=${OMP_NUM_THREADS:-4}
    export MKL_NUM_THREADS=${MKL_NUM_THREADS:-4}
    export OPENBLAS_NUM_THREADS=${OPENBLAS_NUM_THREADS:-4}
    export NUMEXPR_NUM_THREADS=${NUMEXPR_NUM_THREADS:-4}
fi

# Verificar espacio en disco
log "Verificando espacio en disco..."
df -h /app
df -h /data 2>/dev/null || log_warning "Directorio /data no montado"

# Pre-calentar el generador si se especifica
if [ "$PRELOAD_MODEL" = "true" ]; then
    log "Pre-cargando modelo..."
    python -c "
from image_generator import GeneradorImagenesConsumibles
try:
    gen = GeneradorImagenesConsumibles()
    print('Modelo pre-cargado exitosamente')
except Exception as e:
    print(f'Error pre-cargando modelo: {e}')
    exit(1)
    " || log_warning "Error pre-cargando modelo"
fi

# Mostrar información del sistema
echo ""
echo "=============================================================================="
echo "                        INFORMACIÓN DEL SISTEMA"
echo "=============================================================================="
echo "🖥️  Dispositivo: $DEVICE_TYPE"
echo "🐍 Python: $(python --version 2>&1)"
echo "🏠 Directorio: $(pwd)"
echo "👤 Usuario: $(whoami)"
echo "💾 Espacio libre: $(df -h /app | tail -1 | awk '{print $4}')"
if [ "$DEVICE_TYPE" = "cuda" ]; then
    echo "🎮 GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader,nounits 2>/dev/null || echo 'No disponible')"
fi
echo "=============================================================================="
echo ""

# Función de limpieza al salir
cleanup() {
    log "Limpiando recursos..."
    if [ "$DEVICE_TYPE" = "cuda" ]; then
        python -c "
try:
    import torch
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        print('Cache GPU limpiado')
except:
    pass
        " 2>/dev/null
    fi
    log_success "Contenedor terminado correctamente"
}

# Registrar función de limpieza
trap cleanup EXIT

# Verificar argumentos
if [ $# -eq 0 ]; then
    log "Ejecutando comando por defecto..."
    exec python generar_cli.py --help
elif [ "$1" = "bash" ] || [ "$1" = "sh" ]; then
    log "Iniciando shell interactivo..."
    exec "$@"
elif [ "$1" = "test" ]; then
    log "Ejecutando test básico..."
    python generar_cli.py --producto "Test Docker" --descripcion "Prueba de contenedor Docker" --variaciones 1 --quiet
elif [ "$1" = "python" ]; then
    log "Ejecutando comando Python..."
    exec "$@"
else
    log "Ejecutando comando personalizado: $*"
    exec "$@"
fi
