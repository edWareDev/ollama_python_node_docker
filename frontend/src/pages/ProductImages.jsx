import { useState, useEffect } from 'react';
import { Image, Download, Eye, ArrowLeft } from 'lucide-react';
import { imageService } from '../services/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function ProductImages() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    style: 'profesional',
    variations: 1,
    size: 480,
    inferenceSteps: 25,
    guidanceScale: 8.0
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableStyles, setAvailableStyles] = useState([]);
  const [isDataFromDescription, setIsDataFromDescription] = useState(false);
  const [imageBlobUrls, setImageBlobUrls] = useState([]);

  useEffect(() => {
    loadAvailableStyles();
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      const storedDescriptions = sessionStorage.getItem('generatedDescriptions');
      const selectedIndex = sessionStorage.getItem('selectedDescriptionIndex');
      
      if (storedDescriptions && selectedIndex !== null) {
        const descriptions = JSON.parse(storedDescriptions);
        const index = parseInt(selectedIndex);
        
        if (descriptions.results && descriptions.results[index]) {
          const selected = descriptions.results[index];
          setFormData(prev => ({
            ...prev,
            productName: selected.titulo || prev.productName,
            productDescription: selected.descripcion || prev.productDescription
          }));
          setIsDataFromDescription(true);
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const loadAvailableStyles = async () => {
    try {
      const response = await imageService.getAvailableStyles();
      if (response.success) {
        setAvailableStyles(response.data.available_styles || []);
      }
    } catch (error) {
      console.error('Error loading styles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName.trim() || !formData.productDescription.trim()) {
      toast.error('El nombre y la descripción del producto son obligatorios');
      return;
    }

    // Preparar datos para la API
    const apiData = {
      productName: formData.productName,
      productDescription: formData.productDescription,
      style: formData.style,
      variations: formData.variations,
      width: formData.size,
      height: formData.size,
      inferenceSteps: formData.inferenceSteps,
      guidanceScale: formData.guidanceScale
    };

    setLoading(true);
    try {
      const response = await imageService.generateImages(apiData);

      if (response.success) {
        setResults(response.data);
        
        // Procesar imágenes base64 y crear URLs blob
        const images = response.data.images || response.data.generated_images || [];
        if (images.length > 0) {
          const blobUrls = images.map(image => {
            if (image.data_url) {
              // Nueva estructura: usar data_url directamente
              return {
                ...image,
                blobUrl: image.data_url,
                base64: image.data_url
              };
            } else if (image.base64_data) {
              // Compatibilidad con estructura anterior
              const dataUrl = `data:image/png;base64,${image.base64_data}`;
              return {
                ...image,
                blobUrl: dataUrl,
                base64: dataUrl
              };
            }
            return image;
          });
          
          setImageBlobUrls(blobUrls);
        }
        
        toast.success('¡Imágenes generadas exitosamente!');
      } else {
        toast.error('Error al generar las imágenes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al generar las imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'variations' || name === 'size' || name === 'inferenceSteps'
        ? parseInt(value)
        : name === 'guidanceScale'
        ? parseFloat(value)
        : value
    }));
  };

  const handleDownload = (imageData, index) => {
    try {
      if (imageData.base64) {
        // Descargar desde base64
        const filename = `${formData.productName.replace(/\s+/g, '_')}_${formData.style}_${index + 1}.png`;
        imageService.downloadImageFromBase64(imageData.base64, filename);
        toast.success('Imagen descargada exitosamente');
      } else if (imageData.filename) {
        // Fallback: descargar desde URL (modo legacy)
        const url = imageService.getDownloadUrl(imageData.filename);
        window.open(url, '_blank');
        toast.success('Descarga iniciada');
      } else {
        toast.error('No se puede descargar la imagen');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Error al descargar la imagen');
    }
  };
  
  const handleViewImage = (imageData) => {
    try {
      if (imageData.blobUrl) {
        // Abrir imagen desde blob URL
        window.open(imageData.blobUrl, '_blank');
      } else if (imageData.base64) {
        // Crear ventana con imagen base64
        const newWindow = window.open();
        newWindow.document.write(`
          <html>
            <head><title>Imagen Generada</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
              <img src="${imageData.base64}" style="max-width:100%; max-height:100vh; object-fit:contain;" alt="Imagen generada" />
            </body>
          </html>
        `);
      } else if (imageData.filename) {
        // Fallback: abrir desde URL
        window.open(imageService.getImageUrl(imageData.filename), '_blank');
      }
    } catch (error) {
      console.error('Error viewing image:', error);
      toast.error('Error al visualizar la imagen');
    }
  };
  
  // Limpiar URLs blob cuando el componente se desmonte o cambien las imágenes
  useEffect(() => {
    return () => {
      if (imageBlobUrls.length > 0) {
        const urls = imageBlobUrls.map(img => img.blobUrl).filter(Boolean);
        imageService.cleanupBlobUrls(urls);
      }
    };
  }, [imageBlobUrls]);

  return (
    <div className="product-images-page">
      <div className="page-header">
        <h1 className="page-title">
          <Image size={32} />
          Generador de Imágenes
        </h1>
        <p className="page-description">
          Crea imágenes profesionales para tus productos con diferentes estilos
          usando inteligencia artificial y Stable Diffusion.
        </p>
        
        {isDataFromDescription && (
          <div className="alert alert-info">
            <span>ℹ️</span>
            <div>
              <strong>Datos cargados automáticamente</strong>
              <p>Se han cargado el título y descripción de la propuesta seleccionada anteriormente.</p>
              <button 
                onClick={() => navigate('/descriptions')} 
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                <ArrowLeft size={16} />
                Volver a Descripciones
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="content-grid">
        <div className="form-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Configuración</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Ej: Chocolate Premium Artesanal"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción del Producto *</label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Chocolate 70% cacao, textura suave, empaque premium..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Estilo</label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    {availableStyles.length > 0 ? availableStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    )) : (
                      <>
                        <option value="profesional">Profesional</option>
                        <option value="artistico">Artístico</option>
                        <option value="minimalista">Minimalista</option>
                        <option value="natural">Natural</option>
                        <option value="premium">Premium</option>
                        <option value="divertido">Divertido</option>
                        <option value="promocional">Promocional</option>
                        <option value="banner">Banner</option>
                        <option value="catalogo">Catálogo</option>
                        <option value="instagram">Instagram</option>
                        <option value="editorial">Editorial</option>
                        <option value="ecommerce">E-Commerce</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tamaño (Ancho × Alto)</label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value={480}>480px × 480px</option>
                    <option value={512}>512px × 512px</option>
                    <option value={576}>576px × 576px</option>
                    <option value={640}>640px × 640px</option>
                    <option value={720}>720px × 720px</option>
                  </select>
                </div>
              </div>

              {/* Parámetros de calidad optimizados */}
              <div className="form-group">
                <div className="quality-info">
                  <h4>⚙️ Configuración Optimizada</h4>
                  <div className="quality-params">
                    <div className="param-item">
                      <span className="param-label">Variaciones:</span>
                      <span className="param-value">{formData.variations} imagen</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Pasos de inferencia:</span>
                      <span className="param-value">{formData.inferenceSteps} (Equilibrio perfecto)</span>
                    </div>
                    <div className="param-item">
                      <span className="param-label">Escala de guía:</span>
                      <span className="param-value">{formData.guidanceScale} (Buena adherencia)</span>
                    </div>
                  </div>
                  <p className="quality-note">
                    💡 Parámetros optimizados para generar imágenes rápidamente con alta calidad.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Generando imágenes...
                  </>
                ) : (
                  <>
                    <Image size={20} />
                    Generar Imágenes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="results-section">
          {results ? (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Imágenes Generadas</h2>
                <p className="card-description">
                  {results.statistics?.total_generated || results.successful_generations || 0} de {results.statistics?.total_generated + results.statistics?.total_failed || results.total_requested || 0} imágenes generadas
                </p>
              </div>

              <div className="image-grid">
                {imageBlobUrls.length > 0 ? imageBlobUrls.map((imageData, index) => (
                  <div key={index} className="image-item">
                    <img
                      src={imageData.blobUrl || imageData.base64 || imageService.getImageUrl(imageData.filename)}
                      alt={`${results.product?.name || results.product_name} - Variación ${index + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="image-item-content">
                      <div className="image-item-title">
                        Variación {index + 1}
                        <span className="image-size-info">
                          {formData.size}x{formData.size}px
                        </span>
                      </div>
                      <div className="image-actions">
                        <button
                          onClick={() => handleViewImage(imageData)}
                          className="btn btn-secondary btn-sm"
                          title="Ver imagen en ventana nueva"
                        >
                          <Eye size={16} />
                          Ver
                        </button>
                        <button
                          onClick={() => handleDownload(imageData, index)}
                          className="btn btn-primary btn-sm"
                          title="Descargar imagen"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                )) : results.generated_images?.map((image, index) => (
                  // Fallback para formato legacy
                  <div key={index} className="image-item">
                    <img
                      src={imageService.getImageUrl(image.filename)}
                      alt={`${results.product?.name || results.product_name} - Variación ${index + 1}`}
                      loading="lazy"
                    />
                    <div className="image-item-content">
                      <div className="image-item-title">
                        Variación {index + 1}
                      </div>
                      <div className="image-actions">
                        <button
                          onClick={() => window.open(imageService.getImageUrl(image.filename), '_blank')}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={16} />
                          Ver
                        </button>
                        <button
                          onClick={() => handleDownload(image, index)}
                          className="btn btn-primary btn-sm"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Image size={48} />
              <h3>Genera imágenes profesionales</h3>
              <p>
                Completa la información del producto y genera imágenes
                promocionales con diferentes estilos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const imageStyles = `
.product-images-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.quality-info {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.quality-info h4 {
  margin: 0 0 1rem 0;
  color: #334155;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quality-params {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.param-item:last-child {
  border-bottom: none;
}

.param-label {
  font-weight: 500;
  color: #475569;
  font-size: 0.875rem;
}

.param-value {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
}

.quality-note {
  margin: 0;
  padding: 0.75rem;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.4;
}

.image-size-info {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 400;
  margin-top: 0.25rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.image-item {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.image-item img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.image-item-content {
  padding: 1rem;
}

.image-item-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .quality-info {
    padding: 1rem;
  }
  
  .param-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = imageStyles;
  document.head.appendChild(style);
}
