# 🤖 Generador de Productos con IA

Una aplicación completa que utiliza inteligencia artificial para generar contenido comercial para productos: descripciones atractivas, imágenes profesionales y comentarios de clientes realistas.

## 🚀 Características

- **📝 Generación de Descripciones**: Crea títulos y descripciones comerciales optimizadas
- **🖼️ Generación de Imágenes**: Produce imágenes profesionales usando Stable Diffusion
- **💬 Comentarios de Productos**: Genera comentarios realistas de clientes y analiza opiniones existentes
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

- **Soporte GPU** para NVIDIA
- **Health checks** integrados

## 📋 Requisitos del Sistema

- **NVIDIA Docker runtime** (para soporte GPU opcional)
- **8GB RAM mínimo** (16GB recomendado)
- **10GB de espacio libre** (para modelos de IA)

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/edWareDev/ollama_python_node_docker
cd ollama_python_node_docker
```

### 2. Configurar Variables de Entorno

```bash
# Crear un archivo .env en la raiz del proyecto con los siguientes campos
#CONFIGURACIONES DE DESPLIEGUE
NODE_ENV = production

#CONFIGURACIÓN DE LA API
API_PORT = 3333

#CONFIGURACION DE OLLAMA
OLLAMA_URL=http://localhost:11434
MODEL_NAME = "gemma3:1b"
```

### 3. Instalar Python

Descargar Python 3.10
En Windows lo puedes conseguir en la Microsoft Store

### 4. Instalacion de las dependencias del servicio Con Python

Ir a la carpeta python_image_generator
y ejecutar install.py con python

### 5. Instalar Ollama

Descargar Ollama segun el sistema operativo
https://ollama.com/download/

Al terminar la instalacion abrir ollama y ejecutar en la terminal

```bash
# Descargar un modelo liviano para Ollama
ollama pull gemma3:1b
```

### 6. Instalar Node.js

Descargar Node.js segun el sistema operativo
https://nodejs.org/en/download

### 7. Ejecutar el backend

Desde la ubicacion root ejecutar:

```bash
# Instalara todas las dependencias del proyecto
npm i
```

```bash
# Iniciará el backend
npm start
```

No cerrar esta terminal

### 8. Ejecutar el frontend

Desde la ubicacion root ejecutar:

```bash
# Iras a la carpeta del frontend
cd ./frontend
```

```bash
# Instalara todas las dependencias del frontend
npm i
```

```bash
# Iniciará el frontend en modo desarrollo
npm run dev
```

Automaticamente se abrira el navegador con los servicios disponibles
No cerrar esta terminal

### 9. Verificar Instalación

- **Frontend**: http://localhost:5174
- **API Backend**: http://localhost:3333
- **Documentación API**: http://localhost:3333/docs
- **Ollama**: http://localhost:11434

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

1. Ve a la parte inferior despues de generar comentarios "Resumir Comentarios"
2. Obtén análisis detallado con insights

## Observaciones del Proyecto

- Al generar imagen por primera vez, el proceso tardara mucho, ya que descargara el modelo de IA. El peso aproximado de este es cerca de 4GB, manualmente puedes ir a la carpeta python_image_generator, y ver cuanto pesa la carpeta models. Si se acerca a 4GB es que ya va a finalizar.

- Si es ejecutado en un servidor o equipo sin recursos suficientes de GPU, es probable que no se logre generar correctamente las imagenes. Tambien hay probabilidad de que no se hayan instalado correctamente las dependencias.

- No me alcanzo el tiempo para crear los archivos Docker para que se ejecute facil y correctamente todo.
