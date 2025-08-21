import { useState, useEffect } from 'react';
import { Image, Download, Eye } from 'lucide-react';
import { imageService } from '../services/apiService';
import toast from 'react-hot-toast';

export function ProductImages() {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    style: 'profesional',
    variations: 3,
    width: 768,
    height: 768,
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableStyles, setAvailableStyles] = useState([]);

  useEffect(() => {
    loadAvailableStyles();
  }, []);

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

    setLoading(true);
    try {
      const response = await imageService.generateImages(formData);
      
      if (response.success) {
        setResults(response.data);
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
      [name]: name === 'variations' || name === 'width' || name === 'height' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleDownload = (filename) => {
    const url = imageService.getDownloadUrl(filename);
    window.open(url, '_blank');
    toast.success('Descarga iniciada');
  };

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
                        <option value="premium">Premium</option>
                        <option value="natural">Natural</option>
                        <option value="minimalista">Minimalista</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Variaciones</label>
                  <select
                    name="variations"
                    value={formData.variations}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} imagen{num > 1 ? 'es' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ancho (px)</label>
                  <select
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value={512}>512px</option>
                    <option value={768}>768px</option>
                    <option value={1024}>1024px</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Alto (px)</label>
                  <select
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value={512}>512px</option>
                    <option value={768}>768px</option>
                    <option value={1024}>1024px</option>
                  </select>
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
                  {results.successful_generations} de {results.total_requested} imágenes generadas
                </p>
              </div>

              <div className="image-grid">
                {results.generated_images?.map((image, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={imageService.getImageUrl(image.filename)} 
                      alt={`${results.product_name} - Variación ${index + 1}`}
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
                          onClick={() => handleDownload(image.filename)}
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = imageStyles;
  document.head.appendChild(style);
}
