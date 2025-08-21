# 🤖 Generador de Productos con IA

Una aplicación completa que utiliza inteligencia artificial para generar contenido comercial para productos: descripciones atractivas, imágenes profesionales y comentarios de clientes realistas.

## 🚀 Características

- **📝 Generación de Descripciones**: Crea títulos y descripciones comerciales optimizadas
- **🖼️ Generación de Imágenes**: Produce imágenes profesionales usando Stable Diffusion
- **💬 Comentarios de Productos**: Genera comentarios realistas de clientes y analiza opiniones existentes
- **🐳 Despliegue con Docker**: Configuración completa con Docker Compose y soporte GPU
- **⚡ Frontend Moderno**: Interfaz React con Vite, responsive y fácil de usar
- **🔌 API RESTful**: Endpoints documentados y listos para integración

## 🛠️ Stack Tecnológico

### Backend

- **Node.js 22** con ES Modules
- **Express.js** para la API REST
- **Ollama** para modelos de IA locales
- **Python** para generación de imágenes (Stable Diffusion)
- **Zod** para validación de datos

### Frontend

- **React 18** sin TypeScript
- **Vite** como bundler
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones

### DevOps

- **Docker** y **Docker Compose**
- **Nginx** como proxy reverso
- **Soporte GPU** para NVIDIA
- **Health checks** integrados

## 📋 Requisitos del Sistema

- **Docker** y **Docker Compose** instalados
- **NVIDIA Docker runtime** (para soporte GPU opcional)
- **8GB RAM mínimo** (16GB recomendado)
- **10GB de espacio libre** (para modelos de IA)

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd ollama-node-docker
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar configuración (opcional)
nano .env
```

### 3. Despliegue con Docker Compose

#### Opción A: Con GPU (Recomendado)

```bash
# Verificar soporte GPU
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# Ejecutar con GPU
docker-compose up -d
```

#### Opción B: Solo CPU

```bash
# Editar docker-compose.yml y comentar la sección GPU
# Luego ejecutar:
docker-compose up -d
```

### 4. Instalar Modelo de IA

```bash
# Acceder al contenedor de Ollama
docker exec -it ollama_service ollama pull gemma3:1b

# O usar otro modelo (opcional)
docker exec -it ollama_service ollama pull llama3:8b
```

### 5. Verificar Instalación

- **Frontend**: http://localhost
- **API Backend**: http://localhost:3000
- **Documentación API**: http://localhost/docs
- **Ollama**: http://localhost:11434

## 💻 Desarrollo Local

### Backend

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📖 Uso de la Aplicación

### 1. Generación de Descripciones

1. Ve a la sección "Descripciones"
2. Ingresa el nombre y detalles del producto
3. Haz clic en "Generar Descripciones"
4. Copia las propuestas generadas

### 2. Generación de Imágenes

1. Ve a la sección "Imágenes"
2. Completa la información del producto
3. Selecciona estilo, variaciones y dimensiones
4. Genera y descarga las imágenes

### 3. Comentarios de Productos

#### Generar Comentarios

1. Ve a la pestaña "Generar Comentarios"
2. Configura producto, número y sentimiento
3. Genera comentarios realistas

#### Resumir Comentarios

1. Ve a la pestaña "Resumir Comentarios"
2. Pega comentarios existentes (uno por línea)
3. Obtén análisis detallado con insights

## 🔌 API Endpoints

### Descripciones de Productos

```
POST /api/chat/generate-detailed-product-info
```

### Imágenes

```
POST /api/images/generate
GET  /api/images/serve/:filename
GET  /api/images/download/:filename
GET  /api/images/list
```

### Comentarios

```
POST /api/comments/generate
POST /api/comments/summarize
```

Ver documentación completa en: http://localhost/docs

## 🐳 Comandos Docker Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Limpiar volúmenes (¡cuidado!)
docker-compose down -v

# Ver estado de los servicios
docker-compose ps
```

## 🔧 Configuración Avanzada

### Cambiar Modelo de IA

```bash
# Listar modelos disponibles
docker exec -it ollama_service ollama list

# Instalar nuevo modelo
docker exec -it ollama_service ollama pull llama3:8b

# Actualizar variable de entorno
MODEL_NAME=llama3:8b
```

### Configurar GPU

```bash
# Verificar drivers NVIDIA
nvidia-smi

# Instalar NVIDIA Container Runtime
curl -s -L https://nvidia.github.io/nvidia-container-runtime/gpgkey | sudo apt-key add -
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-container-runtime/$distribution/nvidia-container-runtime.list | sudo tee /etc/apt/sources.list.d/nvidia-container-runtime.list
sudo apt-get update
sudo apt-get install nvidia-container-runtime
```

## 🚨 Solución de Problemas

### Error: Puerto ocupado

```bash
# Verificar qué proceso usa el puerto
sudo lsof -i :3000
sudo lsof -i :80

# Cambiar puerto en .env
API_PORT=3001
```

### Error: GPU no detectada

```bash
# Verificar NVIDIA runtime
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# Si falla, usar versión CPU
# Comentar sección GPU en docker-compose.yml
```

### Error: Modelo no encontrado

```bash
# Verificar modelos instalados
docker exec -it ollama_service ollama list

# Instalar modelo necesario
docker exec -it ollama_service ollama pull gemma3:1b
```

### Limpiar cache y reiniciar

```bash
# Detener servicios
docker-compose down

# Limpiar imágenes Docker
docker system prune -f

# Reconstruir y ejecutar
docker-compose up --build -d
```

## 📊 Monitoreo y Logs

### Ver Estado de Servicios

```bash
# Estado general
docker-compose ps

# Health checks
docker-compose exec backend curl -f http://localhost:3000/api/images/service/status
```

### Logs Detallados

```bash
# Todos los logs
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo Ollama
docker-compose logs -f ollama
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver `package.json` para más detalles.

## 🆘 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la sección de solución de problemas
2. Verifica los logs con `docker-compose logs -f`
3. Abre un issue en el repositorio

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
# Obtener últimos cambios
git pull origin main

# Reconstruir y ejecutar
docker-compose up --build -d

# Actualizar modelos de IA si es necesario
docker exec -it ollama_service ollama pull gemma3:1b
```

---

⭐ **¡No olvides dar una estrella al repositorio si te ha sido útil!** ⭐
