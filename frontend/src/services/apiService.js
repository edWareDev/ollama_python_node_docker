import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutos - para generaciones que pueden tomar tiempo
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Error del servidor con respuesta
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'Error del servidor');
    } else if (error.request) {
      // Error de red
      console.error('Network Error:', error.request);
      throw new Error('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } else {
      // Otro tipo de error
      console.error('Error:', error.message);
      throw new Error(error.message || 'Error inesperado');
    }
  }
);

// === SERVICIOS DE PRODUCTOS ===

export const productService = {
  // Generar descripciones de productos
  async generateDescriptions(data) {
    const response = await apiClient.post('/chat/generate-detailed-product-info', data);
    return response.data;
  },
};

// === SERVICIOS DE IMÁGENES ===

export const imageService = {
  // Generar imágenes de productos (con base64 en respuesta)
  async generateImages(data) {
    // Agregar parámetro para recibir imágenes en base64
    const requestData = {
      ...data,
      returnBase64: true,
      optimizeForWeb: true
    };
    
    const response = await apiClient.post('/images/generate', requestData);
    return response.data;
  },

  // Obtener estilos disponibles
  async getAvailableStyles() {
    const response = await apiClient.get('/images/styles');
    return response.data;
  },

  // Verificar estado del servicio
  async checkServiceStatus() {
    const response = await apiClient.get('/images/service/status');
    return response.data;
  },

  // Listar imágenes generadas
  async listImages(params = {}) {
    const response = await apiClient.get('/images/list', { params });
    return response.data;
  },

  // Obtener metadata de imagen
  async getImageMetadata(imageId) {
    const response = await apiClient.get(`/images/metadata/${imageId}`);
    return response.data;
  },

  // Utilidades para manejo de imágenes en memoria
  
  // Crear URL de objeto desde base64
  createImageBlobUrl(base64String) {
    try {
      // Determinar el tipo MIME desde el header base64
      const [header, data] = base64String.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
      
      // Convertir base64 a blob
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Crear URL de objeto
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return null;
    }
  },

  // Descargar imagen desde base64
  downloadImageFromBase64(base64String, filename = 'imagen.png') {
    try {
      // Crear blob URL temporal
      const blobUrl = this.createImageBlobUrl(base64String);
      if (!blobUrl) return;
      
      // Crear elemento de descarga temporal
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Limpiar URL temporal después de un momento
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  },

  // Comprimir imagen base64 (opcional, para optimización adicional)
  compressBase64Image(base64String, quality = 0.8, maxWidth = 1024) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspecto
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 comprimido
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = base64String;
    });
  },

  // Limpiar URLs de objetos (llamar cuando se desmonte el componente)
  cleanupBlobUrls(urls) {
    urls.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  },

  // === MÉTODOS LEGACY (para compatibilidad) ===
  
  // Construir URLs para servir/descargar imágenes (fallback)
  getImageUrl(filename) {
    return `${API_BASE_URL}/images/serve/${filename}`;
  },

  getDownloadUrl(filename) {
    return `${API_BASE_URL}/images/download/${filename}`;
  },
};

// === SERVICIOS DE COMENTARIOS ===

export const commentService = {
  // Generar comentarios de productos
  async generateComments(data) {
    const response = await apiClient.post('/comments/generate', data);
    return response.data;
  },

  // Resumir comentarios
  async summarizeComments(data) {
    const response = await apiClient.post('/comments/summarize', data);
    return response.data;
  },
};

// === SERVICIOS GENERALES ===

export const generalService = {
  // Verificar salud general de la API
  async checkHealth() {
    try {
      const checks = await Promise.allSettled([
        apiClient.get('/images/service/status'),
        apiClient.get('/comments/endpoints'),
        apiClient.get('/images/endpoints'),
      ]);

      return {
        api_accessible: true,
        services: {
          images: checks[0].status === 'fulfilled',
          comments: checks[1].status === 'fulfilled',
          general: checks[2].status === 'fulfilled',
        }
      };
    } catch (error) {
      return {
        api_accessible: false,
        error: error.message
      };
    }
  },

  // Obtener documentación de endpoints
  async getEndpointDocs() {
    const [images, comments] = await Promise.all([
      apiClient.get('/images/endpoints'),
      apiClient.get('/comments/endpoints'),
    ]);

    return {
      images: images.data,
      comments: comments.data,
    };
  },
};

export default {
  productService,
  imageService,
  commentService,
  generalService,
};
