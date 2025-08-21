# =============================================================================
# Dockerfile para Generador de Imágenes con IA
# Soporte automático para GPU (CUDA) y CPU
# =============================================================================

# Usar imagen base Python que soporte tanto GPU como CPU
ARG PYTHON_VERSION=3.10
FROM python:${PYTHON_VERSION}-slim

# Metadatos
LABEL maintainer="tu-email@ejemplo.com"
LABEL description="Generador de Imágenes con IA usando Stable Diffusion"
LABEL version="1.0.0"

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Variables de entorno para detección automática GPU/CPU
ENV CUDA_VISIBLE_DEVICES=all
ENV TORCH_HOME=/app/modelos/torch

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    build-essential \
    ffmpeg \
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libxrender1 \
    libglib2.0-0 \
    libgcc-s1 \
    && rm -rf /var/lib/apt/lists/*

# Actualizar pip
RUN python -m pip install --upgrade pip setuptools wheel

# Instalar PyTorch (detectará automáticamente si hay CUDA disponible)
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Crear directorio de aplicación
WORKDIR /app

# Copiar archivos de requirements primero (para cache de Docker)
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir \
    diffusers>=0.35.0 \
    transformers>=4.55.0 \
    accelerate>=1.10.0 \
    compel>=2.0.0 \
    Pillow>=11.0.0 \
    numpy>=2.1.0 \
    safetensors>=0.6.0 \
    huggingface_hub>=0.34.0 \
    requests>=2.32.0 \
    tqdm>=4.67.0 \
    packaging>=25.0 \
    psutil>=7.0.0 \
    pyyaml>=6.0.2

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p /app/imagenes_consumibles \
             /app/metadata \
             /app/modelos \
             /data/models \
             /data/output

# Crear usuario no-root para seguridad
RUN groupadd -r aiuser && useradd -r -g aiuser -d /app -s /bin/bash aiuser

# Dar permisos al usuario
RUN chown -R aiuser:aiuser /app /data

# Copiar script de entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar a usuario no-root
USER aiuser

# Exponer puerto (si se necesita API web en el futuro)
EXPOSE 8000

# Volúmenes para datos persistentes
VOLUME ["/app/imagenes_consumibles", "/app/metadata", "/app/modelos", "/data"]

# Healthcheck para verificar que el contenedor funciona
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD python -c "import torch; import diffusers; print('OK')" || exit 1

# Entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Comando por defecto
CMD ["python", "generar_cli.py", "--help"]
