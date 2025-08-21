import { useState } from 'react';
import { FileText, Sparkles, Copy, CheckCheck } from 'lucide-react';
import { productService } from '../services/apiService';
import toast from 'react-hot-toast';

export function ProductDescriptions() {
  const [formData, setFormData] = useState({
    productName: '',
    productAditionalInfo: ''
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedItems, setCopiedItems] = useState(new Set());

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const response = await productService.generateDescriptions(formData);
      
      if (response.success) {
        setResults(response.respuesta.data);
        toast.success('¡Descripciones generadas exitosamente!');
      } else {
        toast.error('Error al generar las descripciones');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al generar las descripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(index));
      toast.success('Texto copiado al portapapeles');
      
      // Remover el indicador de copiado después de 2 segundos
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error('Error al copiar el texto');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="product-descriptions-page">
      <div className="page-header">
        <h1 className="page-title">
          <FileText size={32} />
          Generador de Descripciones
        </h1>
        <p className="page-description">
          Crea títulos comerciales atractivos y descripciones detalladas para tus productos 
          usando inteligencia artificial. Perfecta para e-commerce y marketing.
        </p>
      </div>

      <div className="content-grid">
        {/* Formulario */}
        <div className="form-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Sparkles size={24} />
                Información del Producto
              </h2>
              <p className="card-description">
                Proporciona los datos básicos de tu producto para generar descripciones optimizadas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="productName" className="form-label">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Ej: Smartphone Pro X1, Chocolate Artesanal..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="productAditionalInfo" className="form-label">
                  Información Adicional (Opcional)
                </label>
                <textarea
                  id="productAditionalInfo"
                  name="productAditionalInfo"
                  value={formData.productAditionalInfo}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  placeholder="Características especiales, beneficios, materiales, dimensiones, etc."
                />
                <small className="form-help">
                  Mientras más detalles proporciones, más específicas serán las descripciones generadas.
                </small>
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
                    Generando descripciones...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generar Descripciones
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Resultados */}
        <div className="results-section">
          {results ? (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <CheckCheck size={24} />
                  Propuestas Generadas
                </h2>
                <p className="card-description">
                  {results.proposals?.length || 0} propuestas creadas para "{results.product_name || formData.productName}"
                </p>
              </div>

              <div className="results-list">
                {results.proposals?.map((proposal, index) => (
                  <div key={index} className="result-item">
                    <div className="result-header">
                      <h3 className="result-title">Propuesta {index + 1}</h3>
                      <div className="result-actions">
                        <button
                          onClick={() => handleCopy(`${proposal.titulo}\n\n${proposal.descripcion_comercial}`, `full-${index}`)}
                          className="btn btn-secondary btn-sm"
                          title="Copiar título y descripción"
                        >
                          {copiedItems.has(`full-${index}`) ? <CheckCheck size={16} /> : <Copy size={16} />}
                          Copiar Todo
                        </button>
                      </div>
                    </div>

                    <div className="result-content">
                      <div className="result-field">
                        <div className="field-header">
                          <label className="field-label">Título</label>
                          <button
                            onClick={() => handleCopy(proposal.titulo, `title-${index}`)}
                            className="btn-copy-field"
                            title="Copiar título"
                          >
                            {copiedItems.has(`title-${index}`) ? <CheckCheck size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="field-content title-content">{proposal.titulo}</p>
                      </div>

                      <div className="result-field">
                        <div className="field-header">
                          <label className="field-label">Descripción Comercial</label>
                          <button
                            onClick={() => handleCopy(proposal.descripcion_comercial, `desc-${index}`)}
                            className="btn-copy-field"
                            title="Copiar descripción"
                          >
                            {copiedItems.has(`desc-${index}`) ? <CheckCheck size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="field-content description-content">{proposal.descripcion_comercial}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.usage && (
                <div className="usage-info">
                  <h4>Información de uso</h4>
                  <div className="usage-stats">
                    <span>Tokens usados: {results.usage.total_tokens}</span>
                    <span>Tiempo de generación: ~{Math.round(results.usage.total_tokens / 100)}s</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={48} />
              <h3>¿Listo para crear descripciones increíbles?</h3>
              <p>
                Completa el formulario y haz clic en "Generar Descripciones" para obtener 
                títulos y descripciones comerciales optimizadas para tu producto.
              </p>
              
              <div className="tips">
                <h4>💡 Consejos para mejores resultados:</h4>
                <ul>
                  <li>Usa nombres de productos específicos y descriptivos</li>
                  <li>Incluye características clave en la información adicional</li>
                  <li>Menciona el público objetivo si es relevante</li>
                  <li>Agrega detalles sobre beneficios únicos del producto</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Estilos para la página
const descriptionsStyles = `
.product-descriptions-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.page-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  align-items: start;
}

.form-help {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-top: 0.5rem;
  display: block;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.result-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-field {
  position: relative;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-copy-field {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-copy-field:hover {
  color: var(--primary-color);
  background: var(--bg-gray-100);
}

.field-content {
  background: var(--bg-gray-50);
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin: 0;
  line-height: 1.6;
}

.title-content {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--text-primary);
}

.description-content {
  color: var(--text-secondary);
}

.usage-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-gray);
}

.usage-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.usage-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.tips {
  background: var(--bg-gray-50);
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
}

.tips h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.tips ul {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  padding-left: 1.5rem;
}

.tips li {
  margin-bottom: 0.5rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .product-descriptions-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .page-description {
    font-size: 1rem;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .result-actions {
    width: 100%;
  }
  
  .result-actions .btn {
    flex: 1;
  }
  
  .field-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .usage-stats {
    flex-direction: column;
    gap: 0.25rem;
  }
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = descriptionsStyles;
  document.head.appendChild(style);
}
