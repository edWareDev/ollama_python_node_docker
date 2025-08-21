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
  // Generar imágenes de productos
  async generateImages(data) {
    const response = await apiClient.post('/images/generate', data);
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

  // Construir URLs para servir/descargar imágenes
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
