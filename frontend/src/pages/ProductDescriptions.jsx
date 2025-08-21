import { useState } from 'react';
import { FileText, Sparkles, Copy, CheckCheck, Image, MessageSquare, ArrowRight } from 'lucide-react';
import { productService } from '../services/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styles from './ProductDescriptions.module.scss';

export function ProductDescriptions() {
  const navigate = useNavigate();
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
      
      if (response.respuesta && response.respuesta.success) {
        setResults(response.respuesta.data);
        toast.success('¡Descripciones generadas exitosamente!');
      } else if (response.success) {
        setResults(response.data);
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

  const handleNextStep = (step) => {
    // Guardar datos en sessionStorage para usar en los siguientes pasos
    const productData = {
      productName: formData.productName,
      productDescription: formData.productAditionalInfo || results?.proposals?.[0]?.descripcion_comercial || '',
      results: results
    };
    sessionStorage.setItem('productData', JSON.stringify(productData));
    
    if (step === 'images') {
      navigate('/images');
    } else if (step === 'comments') {
      navigate('/comments');
    }
  };

  return (
    <div className={styles.productDescriptionsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.stepIndicator}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepText}>Generar títulos y descripciones atractivas</div>
        </div>
        
        <h1 className={styles.pageTitle}>
          <FileText size={32} />
          Generador de Descripciones
        </h1>
        <p className={styles.pageDescription}>
          Crea títulos comerciales atractivos y descripciones detalladas para tus productos 
          usando inteligencia artificial. Perfecta para e-commerce y marketing.
        </p>
      </div>

      <div className={styles.contentGrid}>
        {/* Formulario */}
        <div className={styles.formSection}>
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

            <form onSubmit={handleSubmit} className={styles.form}>
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
                className={`btn btn-primary btn-lg ${styles.submitButton}`}
                disabled={loading}
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

              <div className={styles.resultsList}>
                {results.proposals?.map((proposal, index) => (
                  <div key={index} className={styles.resultItem}>
                    <div className={styles.resultHeader}>
                      <h3 className={styles.resultTitle}>Propuesta {index + 1}</h3>
                      <div className={styles.resultActions}>
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

                    <div className={styles.resultContent}>
                      <div className={styles.resultField}>
                        <div className={styles.fieldHeader}>
                          <label className={styles.fieldLabel}>Título</label>
                          <button
                            onClick={() => handleCopy(proposal.titulo, `title-${index}`)}
                            className={styles.btnCopyField}
                            title="Copiar título"
                          >
                            {copiedItems.has(`title-${index}`) ? <CheckCheck size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className={`${styles.fieldContent} ${styles.titleContent}`}>{proposal.titulo}</p>
                      </div>

                      <div className={styles.resultField}>
                        <div className={styles.fieldHeader}>
                          <label className={styles.fieldLabel}>Descripción Comercial</label>
                          <button
                            onClick={() => handleCopy(proposal.descripcion_comercial, `desc-${index}`)}
                            className={styles.btnCopyField}
                            title="Copiar descripción"
                          >
                            {copiedItems.has(`desc-${index}`) ? <CheckCheck size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className={`${styles.fieldContent} ${styles.descriptionContent}`}>{proposal.descripcion_comercial}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.usage && (
                <div className={styles.usageInfo}>
                  <h4>Información de uso</h4>
                  <div className={styles.usageStats}>
                    <span>Tokens usados: {results.usage.total_tokens}</span>
                    <span>Tiempo de generación: ~{Math.round(results.usage.total_tokens / 100)}s</span>
                  </div>
                </div>
              )}
              
              {/* Botones de siguiente paso */}
              <div className={styles.actionButtons}>
                <button
                  onClick={() => handleNextStep('images')}
                  className={styles.nextStepButton}
                  title="Continuar al paso 2: Generar imágenes"
                >
                  <Image size={20} />
                  Paso 2: Generar Imágenes
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => handleNextStep('comments')}
                  className="btn btn-secondary"
                  title="Saltar al paso 3: Generar comentarios"
                >
                  <MessageSquare size={20} />
                  Paso 3: Generar Comentarios
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={48} />
              <h3>¿Listo para crear descripciones increíbles?</h3>
              <p>
                Completa el formulario y haz clic en "Generar Descripciones" para obtener 
                títulos y descripciones comerciales optimizadas para tu producto.
              </p>
              
              <div className={styles.tips}>
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
