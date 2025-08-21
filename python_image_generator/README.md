# Generador de Imágenes con IA

Un generador de imágenes potente y fácil de usar que aprovecha automáticamente tu hardware disponible (GPU o CPU) para crear imágenes promocionales de productos consumibles usando Stable Diffusion.

## Características

- **Detección automática de hardware**: Usa GPU si está disponible, caso contrario funciona en CPU
- **Optimizado para productos alimenticios**: Prompts especializados para generar imágenes atractivas de comida
- **6 estilos diferentes**: profesional, artístico, minimalista, natural, premium, divertido
- **CLI fácil de usar**: Interfaz de línea de comandos simple e intuitiva
- **Compatible con Node.js**: Output en JSON para integración con aplicaciones web
- **Metadata completa**: Rastrea todos los detalles de las imágenes generadas
- **Gestión automática de memoria**: Limpieza automática de VRAM/RAM

## Instalación Rápida

### Opción 1: Instalación Automática (Recomendado)
```bash
python install.py
```

El script detectará automáticamente tu hardware y instalará las dependencias correctas.

### Opción 2: Instalación Manual

1. **Para sistemas con GPU NVIDIA:**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

2. **Para sistemas solo CPU:**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

## Uso Rápido

### Generar una imagen simple
```bash
python generar_cli.py --producto "Manzana roja" --descripcion "Una manzana fresca y crujiente"
```

### Generar múltiples variaciones con estilo específico
```bash
python generar_cli.py \
  --producto "Chocolate Artesanal" \
  --descripcion "Tableta de chocolate oscuro con 70% cacao" \
  --estilo premium \
  --variaciones 3 \
  --width 768 \
  --height 768
```

### Generación rápida en baja resolución
```bash
python generar_cli.py \
  --producto "Pizza Margherita" \
  --descripcion "Pizza clásica con tomate, mozzarella y albahaca" \
  --width 512 \
  --height 512 \
  --pasos 20
```

## Estilos Disponibles

| Estilo | Descripción | Mejor para |
|--------|-------------|------------|
| `profesional` | Fotografía comercial con iluminación de estudio | Catálogos, e-commerce |
| `artistico` | Composición creativa con iluminación dramática | Marketing premium, redes sociales |
| `minimalista` | Composición simple y elegante | Productos modernos, apps |
| `natural` | Sensación orgánica con iluminación natural | Productos orgánicos, artesanales |
| `premium` | Presentación lujosa y sofisticada | Productos de alta gama |
| `divertido` | Colores vibrantes y presentación alegre | Productos para niños, snacks |

## Parámetros Disponibles

```bash
python generar_cli.py [OPCIONES]
```

### Parámetros Requeridos
- `--producto`: Nombre del producto (ej: "Chocolate Premium")
- `--descripcion`: Descripción detallada (ej: "Chocolate artesanal con cacao 70%")

### Parámetros Opcionales
- `--estilo`: Estilo de imagen (default: profesional)
- `--variaciones`: Número de imágenes a generar (default: 3, max: 20)
- `--width`: Ancho en píxeles (default: 768, rango: 256-2048)
- `--height`: Alto en píxeles (default: 768, rango: 256-2048)
- `--pasos`: Pasos de inferencia - más pasos = mejor calidad (default: 25, rango: 10-100)
- `--guidance`: Adherencia al prompt (default: 7.5, rango: 1.0-20.0)
- `--output-dir`: Directorio personalizado para guardar imágenes
- `--quiet`: Modo silencioso - solo output JSON

## Estructura de Archivos

```
python_image_generator/
├── generar_cli.py          # Script CLI principal
├── image_generator.py      # Lógica del generador
├── install.py              # Instalador automático
├── requirements.txt        # Dependencias
├── README.md               # Esta documentación
├── imagenes_consumibles/   # Imágenes generadas
│   └── *.png
├── metadata/               # Archivos de metadatos JSON
│   ├── sesion_*.json
│   └── lote_*.json
└── modelos/                # Modelos de IA descargados (auto-creado)
    └── stable-diffusion-v1-5/
```

## Integración con Node.js

El generador produce output JSON que se puede integrar fácilmente:

```javascript
const { exec } = require('child_process');

const generarImagen = (producto, descripcion) => {
  return new Promise((resolve, reject) => {
    const comando = `python generar_cli.py --producto "${producto}" --descripcion "${descripcion}" --quiet`;
    
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      try {
        const resultado = JSON.parse(stdout);
        resolve(resultado);
      } catch (e) {
        reject(new Error('Error parsing JSON: ' + e.message));
      }
    });
  });
};

// Uso
generarImagen("Café Premium", "Granos de café tostado oscuro")
  .then(resultado => {
    console.log(`Generadas: ${resultado.datos.estadisticas.total_generadas} imágenes`);
    resultado.datos.imagenes.forEach(img => {
      console.log(`Imagen: ${img.ruta_absoluta}`);
    });
  })
  .catch(error => console.error('Error:', error));
```

## Requisitos del Sistema

### Requisitos Mínimos
- Python 3.8+
- 4GB RAM
- 10GB espacio libre

### Requisitos Recomendados
- Python 3.10+
- 16GB RAM
- GPU NVIDIA con 6GB+ VRAM
- 20GB espacio libre

### GPUs Soportadas
- RTX 3060, 3070, 3080, 3090 series
- RTX 4060, 4070, 4080, 4090 series
- GTX 1660, 1070, 1080 series
- Cualquier GPU con CUDA Compute Capability 6.0+

## Verificar Instalación

```bash
python -c "import torch; print('CUDA disponible:', torch.cuda.is_available())"
python -c "import torch; print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

## Ejemplos de Output JSON

```json
{
  "exito": true,
  "mensaje": "Se generaron 2 de 2 imágenes solicitadas",
  "timestamp": "2025-01-21T10:30:45.123456",
  "datos": {
    "session_id": "abc123ef",
    "producto": {
      "nombre": "Chocolate Premium",
      "descripcion": "Chocolate artesanal 70% cacao",
      "tipo": "consumible"
    },
    "configuracion": {
      "estilo": "premium",
      "variaciones_solicitadas": 2,
      "dimensiones": {"width": 768, "height": 768},
      "dispositivo": "cuda"
    },
    "estadisticas": {
      "total_generadas": 2,
      "total_fallidas": 0,
      "tasa_exito": 100.0
    },
    "imagenes": [
      {
        "id": "abc123ef_01",
        "nombre_archivo": "Chocolate_Premium_premium_abc123ef_01.png",
        "ruta_absoluta": "C:/path/to/imagenes_consumibles/Chocolate_Premium_premium_abc123ef_01.png",
        "url_file": "file://C:/path/to/imagenes_consumibles/Chocolate_Premium_premium_abc123ef_01.png",
        "metadata": {
          "tamano_bytes": 524288,
          "dimensiones": {"width": 768, "height": 768},
          "hash_sha256": "a1b2c3d4..."
        }
      }
    ]
  }
}
```

## Rendimiento

### Con RTX 3070 Ti (8GB VRAM):
- Imagen 512x512: ~2-3 segundos
- Imagen 768x768: ~4-6 segundos
- Imagen 1024x1024: ~8-12 segundos

### Con CPU (16GB RAM):
- Imagen 512x512: ~30-60 segundos
- Imagen 768x768: ~60-120 segundos

## Solución de Problemas

### Imagen aparece completamente negra
```bash
# Problema: Modelo corrupto o incompatible
# Solución: Eliminar cache de modelos y volver a descargar
rm -rf ./modelos
python generar_cli.py --producto "Test" --descripcion "Prueba simple"
```

### Error "CUDA out of memory"
```bash
# Reducir resolución o número de pasos
python generar_cli.py --width 512 --height 512 --pasos 15 [otros parámetros]
```

### Instalación lenta
```bash
# Usar mirrors más rápidos
pip install --upgrade pip
python install.py
```

## Licencia

Este proyecto usa modelos y bibliotecas con diferentes licencias:
- Stable Diffusion: CreativeML Open RAIL-M License
- PyTorch: BSD License
- Diffusers: Apache 2.0 License

## Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una branch para tu feature
3. Commit tus cambios
4. Push a la branch
5. Crea un Pull Request

---

# 🐳 Despliegue con Docker

## Instalación Rápida con Docker

### Opción 1: Docker Compose (Recomendado)

1. **Clonar el repositorio:**
```bash
git clone <tu-repositorio>
cd python_image_generator
```

2. **Configuración inicial:**
```bash
# Windows (PowerShell)
.\docker-utils.ps1 -Command setup -Mode gpu

# Linux/Mac
cp .env.example .env
mkdir -p imagenes_consumibles metadata docker-data
```

3. **Construir y ejecutar:**
```bash
# Para sistemas con GPU NVIDIA
docker-compose up --build

# Para sistemas solo CPU
docker-compose -f docker-compose.cpu.yml up --build
```

### Opción 2: Docker Manual

```bash
# Construir imagen GPU
docker build -t ai-image-generator:gpu .

# Construir imagen CPU
docker build -f Dockerfile.cpu -t ai-image-generator:cpu .

# Ejecutar contenedor GPU
docker run --rm -it --gpus all \
  -v "$(pwd)/imagenes_consumibles:/app/imagenes_consumibles" \
  -v "$(pwd)/metadata:/app/metadata" \
  ai-image-generator:gpu

# Ejecutar contenedor CPU
docker run --rm -it \
  -v "$(pwd)/imagenes_consumibles:/app/imagenes_consumibles" \
  -v "$(pwd)/metadata:/app/metadata" \
  ai-image-generator:cpu
```

## Uso con Docker

### Generar Imágenes

```bash
# Usar el contenedor para generar imágenes
docker run --rm --gpus all \
  -v "$(pwd)/imagenes_consumibles:/app/imagenes_consumibles" \
  -v "$(pwd)/metadata:/app/metadata" \
  ai-image-generator:gpu \
  python generar_cli.py --producto "Chocolate Premium" --descripcion "Chocolate artesanal 70% cacao" --estilo premium --variaciones 3
```

### Shell Interactivo

```bash
# Abrir shell en el contenedor
docker run --rm -it --gpus all \
  -v "$(pwd)/imagenes_consumibles:/app/imagenes_consumibles" \
  -v "$(pwd)/metadata:/app/metadata" \
  ai-image-generator:gpu bash
```

## Scripts de Utilidad

### Windows PowerShell

```powershell
# Configuración inicial
.\docker-utils.ps1 -Command setup -Mode gpu

# Construir imagen
.\docker-utils.ps1 -Command build -Mode gpu

# Ejecutar contenedor interactivo
.\docker-utils.ps1 -Command run -Mode gpu

# Probar el generador
.\docker-utils.ps1 -Command test -Mode gpu

# Ver logs
.\docker-utils.ps1 -Command logs

# Limpiar todo
.\docker-utils.ps1 -Command clean -Force
```

## Configuración Avanzada

### Variables de Entorno

Copiar `.env.example` a `.env` y personalizar:

```bash
# Hardware
FORCE_CPU=false
PRELOAD_MODEL=false

# GPU
CUDA_VISIBLE_DEVICES=all
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512

# Recursos
MEMORY_LIMIT=16g
CPU_LIMIT=4.0
```

### Docker Compose Profiles

```bash
# Solo servicio principal
docker-compose up

# Con proxy Nginx
docker-compose --profile web up

# Con Redis cache
docker-compose --profile cache up

# Con todos los servicios
docker-compose --profile web --profile cache up
```

### Volúmenes Persistentes

- `./imagenes_consumibles` - Imágenes generadas
- `./metadata` - Archivos JSON con metadata
- `./docker-data/models` - Cache de modelos de IA
- `./docker-data/data` - Datos adicionales
- `./docker-data/logs` - Logs del contenedor

## Integración con CI/CD

### GitHub Actions

El repositorio incluye workflows automáticos:

- **Build automático** en push a main/develop
- **Tests de seguridad** con Trivy
- **Multi-platform builds** (AMD64, ARM64)
- **Push a registries** (GitHub Container Registry)
- **Releases automáticos** en tags

### Registry Images

```bash
# Descargar imágenes pre-construidas
docker pull ghcr.io/tu-usuario/ai-image-generator:latest-gpu
docker pull ghcr.io/tu-usuario/ai-image-generator:latest-cpu
```

## Monitoreo y Logs

### Health Checks

```bash
# Verificar salud del contenedor
docker ps --filter name=ai-image-generator
docker inspect ai-image-generator | grep Health
```

### Logs y Debug

```bash
# Ver logs en tiempo real
docker-compose logs -f ai-image-generator

# Logs específicos
docker logs ai-image-generator-container

# Debug mode
docker-compose exec ai-image-generator python generar_cli.py --help
```

## Recursos del Sistema

### Requisitos Docker

**GPU (Recomendado):**
- Docker 20.10+
- NVIDIA Container Toolkit
- GPU NVIDIA con 6GB+ VRAM
- 16GB RAM del host
- 50GB espacio libre

**CPU:**
- Docker 20.10+
- 8GB RAM del host
- 4+ CPU cores
- 30GB espacio libre

### Optimizaciones

```bash
# Limpiar cache periódicamente
docker system prune -f
docker volume prune -f

# Monitorear recursos
docker stats ai-image-generator-container

# Limitar recursos
docker run --memory=8g --cpus="4.0" ...
```

## Troubleshooting Docker

### GPU no detectada
```bash
# Verificar NVIDIA Docker
docker run --rm --gpus all nvidia/cuda:11.8-base-ubuntu20.04 nvidia-smi

# Instalar NVIDIA Container Toolkit
curl -s -L https://nvidia.github.io/nvidia-container-runtime/gpgkey | sudo apt-key add -
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-container-runtime/$distribution/nvidia-container-runtime.list | sudo tee /etc/apt/sources.list.d/nvidia-container-runtime.list
sudo apt-get update && sudo apt-get install -y nvidia-container-runtime
sudo systemctl restart docker
```

### Out of Memory
```bash
# Aumentar memoria disponible
docker run --memory=16g --memory-swap=32g ...

# Usar imagen CPU
docker-compose -f docker-compose.cpu.yml up
```

### Permisos de archivos
```bash
# Arreglar permisos en Linux
sudo chown -R $USER:$USER imagenes_consumibles metadata docker-data
```

---

¿Tienes preguntas? Crea un issue en el repositorio o consulta la documentación de las bibliotecas utilizadas.
