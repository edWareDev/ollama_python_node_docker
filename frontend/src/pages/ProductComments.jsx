import { useState } from 'react';
import { MessageSquare, Sparkles, BarChart3, Star, Calendar, ThumbsUp } from 'lucide-react';
import { commentService } from '../services/apiService';
import toast from 'react-hot-toast';

export function ProductComments() {
  const [activeTab, setActiveTab] = useState('generate');
  const [generateForm, setGenerateForm] = useState({
    productName: '',
    productDescription: '',
    numberOfComments: 5,
    sentiment: 'mixed'
  });
  const [summarizeForm, setSummarizeForm] = useState({
    productName: '',
    comments: ''
  });
  
  const [generateResults, setGenerateResults] = useState(null);
  const [summarizeResults, setSummarizeResults] = useState(null);
  const [loading, setLoading] = useState({ generate: false, summarize: false });

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    
    if (!generateForm.productName.trim() || !generateForm.productDescription.trim()) {
      toast.error('El nombre y la descripción del producto son obligatorios');
      return;
    }

    setLoading(prev => ({ ...prev, generate: true }));
    try {
      const response = await commentService.generateComments(generateForm);
      
      if (response.success) {
        setGenerateResults(response.data);
        toast.success('¡Comentarios generados exitosamente!');
      } else {
        toast.error('Error al generar los comentarios');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al generar los comentarios');
    } finally {
      setLoading(prev => ({ ...prev, generate: false }));
    }
  };

  const handleSummarizeSubmit = async (e) => {
    e.preventDefault();
    
    if (!summarizeForm.productName.trim() || !summarizeForm.comments.trim()) {
      toast.error('El nombre del producto y los comentarios son obligatorios');
      return;
    }

    // Convertir comentarios de texto a array
    const commentsArray = summarizeForm.comments
      .split('\n')
      .filter(comment => comment.trim().length > 0);

    if (commentsArray.length === 0) {
      toast.error('Debe proporcionar al menos un comentario');
      return;
    }

    const data = {
      productName: summarizeForm.productName,
      comments: commentsArray
    };

    setLoading(prev => ({ ...prev, summarize: true }));
    try {
      const response = await commentService.summarizeComments(data);
      
      if (response.success) {
        setSummarizeResults(response.data);
        toast.success('¡Comentarios resumidos exitosamente!');
      } else {
        toast.error('Error al resumir los comentarios');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al resumir los comentarios');
    } finally {
      setLoading(prev => ({ ...prev, summarize: false }));
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < rating ? 'star-filled' : 'star-empty'} 
      />
    ));
  };

  return (
    <div className="product-comments-page">
      <div className="page-header">
        <h1 className="page-title">
          <MessageSquare size={32} />
          Generador de Comentarios
        </h1>
        <p className="page-description">
          Genera comentarios realistas de clientes para tus productos o resume comentarios 
          existentes para obtener insights valiosos sobre la opinión de tus usuarios.
        </p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <Sparkles size={20} />
          Generar Comentarios
        </button>
        <button 
          className={`tab ${activeTab === 'summarize' ? 'active' : ''}`}
          onClick={() => setActiveTab('summarize')}
        >
          <BarChart3 size={20} />
          Resumir Comentarios
        </button>
      </div>

      {activeTab === 'generate' && (
        <div className="tab-content">
          <div className="content-grid">
            <div className="form-section">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <Sparkles size={24} />
                    Configuración
                  </h2>
                </div>

                <form onSubmit={handleGenerateSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nombre del Producto *</label>
                    <input
                      type="text"
                      value={generateForm.productName}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, productName: e.target.value }))}
                      className="form-control"
                      placeholder="Ej: Auriculares Bluetooth Pro"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descripción del Producto *</label>
                    <textarea
                      value={generateForm.productDescription}
                      onChange={(e) => setGenerateForm(prev => ({ ...prev, productDescription: e.target.value }))}
                      className="form-control"
                      rows="3"
                      placeholder="Auriculares inalámbricos con cancelación de ruido, batería 30h..."
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Número de Comentarios</label>
                      <select
                        value={generateForm.numberOfComments}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, numberOfComments: parseInt(e.target.value) }))}
                        className="form-control"
                      >
                        {[3, 5, 8, 10, 15, 20].map(num => (
                          <option key={num} value={num}>{num} comentarios</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tipo de Sentimiento</label>
                      <select
                        value={generateForm.sentiment}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, sentiment: e.target.value }))}
                        className="form-control"
                      >
                        <option value="mixed">Mixto (Realista)</option>
                        <option value="positive">Mayormente Positivo</option>
                        <option value="negative">Mayormente Negativo</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading.generate}
                    style={{ width: '100%' }}
                  >
                    {loading.generate ? (
                      <>
                        <div className="spinner"></div>
                        Generando comentarios...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generar Comentarios
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="results-section">
              {generateResults ? (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">
                      <MessageSquare size={24} />
                      Comentarios Generados
                    </h2>
                    <p className="card-description">
                      {generateResults.total_comments} comentarios para "{generateResults.product_name}"
                    </p>
                  </div>

                  <div className="comments-list">
                    {generateResults.comments?.map((comment, index) => (
                      <div key={index} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-user">
                            <strong>{comment.usuario}</strong>
                            <div className="comment-rating">
                              {renderStars(comment.calificacion)}
                              <span className="rating-number">({comment.calificacion}/5)</span>
                            </div>
                          </div>
                        </div>
                        <p className="comment-text">{comment.comentario}</p>
                        <div className="comment-meta">
                          <span className="comment-date">
                            <Calendar size={12} />
                            {comment.fecha_relativa}
                          </span>
                          <span className="comment-helpful">
                            <ThumbsUp size={12} />
                            {comment.util} personas encontraron esto útil
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <h3>Genera comentarios realistas</h3>
                  <p>
                    Configura los parámetros y genera comentarios de clientes 
                    realistas para tu producto usando IA.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'summarize' && (
        <div className="tab-content">
          <div className="content-grid">
            <div className="form-section">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <BarChart3 size={24} />
                    Analizar Comentarios
                  </h2>
                </div>

                <form onSubmit={handleSummarizeSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nombre del Producto *</label>
                    <input
                      type="text"
                      value={summarizeForm.productName}
                      onChange={(e) => setSummarizeForm(prev => ({ ...prev, productName: e.target.value }))}
                      className="form-control"
                      placeholder="Producto a analizar"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Comentarios a Analizar *</label>
                    <textarea
                      value={summarizeForm.comments}
                      onChange={(e) => setSummarizeForm(prev => ({ ...prev, comments: e.target.value }))}
                      className="form-control"
                      rows="10"
                      placeholder={`Pega los comentarios aquí, uno por línea:

Excelente producto, muy satisfecho
La calidad es buena pero el precio un poco alto
Funciona perfecto, lo recomiendo
El envío fue rápido pero el empaque llegó dañado`}
                      required
                    />
                    <small className="form-help">
                      Ingresa un comentario por línea. Máximo 100 comentarios.
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading.summarize}
                    style={{ width: '100%' }}
                  >
                    {loading.summarize ? (
                      <>
                        <div className="spinner"></div>
                        Analizando comentarios...
                      </>
                    ) : (
                      <>
                        <BarChart3 size={20} />
                        Resumir Comentarios
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="results-section">
              {summarizeResults ? (
                <div className="summary-section">
                  <div className="summary-header">
                    <h2 className="summary-title">
                      <BarChart3 size={24} />
                      Resumen de Análisis
                    </h2>
                    <p className="summary-description">
                      Análisis de {summarizeResults.total_comments_analyzed} comentarios para "{summarizeResults.product_name}"
                    </p>
                  </div>

                  <div className="summary-content">
                    <div className="summary-item">
                      <h4>📋 Resumen General</h4>
                      <p>{summarizeResults.summary?.resumen_general}</p>
                    </div>

                    <div className="summary-item">
                      <h4>✅ Aspectos Positivos</h4>
                      <ul>
                        {Array.isArray(summarizeResults.summary?.aspectos_positivos) ? 
                          summarizeResults.summary.aspectos_positivos.map((aspect, index) => (
                            <li key={index}>{aspect}</li>
                          )) : 
                          <li>{summarizeResults.summary?.aspectos_positivos}</li>
                        }
                      </ul>
                    </div>

                    <div className="summary-item">
                      <h4>⚠️ Aspectos Negativos</h4>
                      <ul>
                        {Array.isArray(summarizeResults.summary?.aspectos_negativos) ? 
                          summarizeResults.summary.aspectos_negativos.map((aspect, index) => (
                            <li key={index}>{aspect}</li>
                          )) : 
                          <li>{summarizeResults.summary?.aspectos_negativos}</li>
                        }
                      </ul>
                    </div>

                    <div className="summary-stats">
                      <div className="stat-item">
                        <div className="stat-value">
                          {summarizeResults.summary?.calificacion_promedio}/5
                        </div>
                        <div className="stat-label">Calificación Promedio</div>
                        <div className="stat-stars">
                          {renderStars(Math.round(summarizeResults.summary?.calificacion_promedio || 0))}
                        </div>
                      </div>
                      
                      <div className="stat-item">
                        <div className="stat-value sentiment-badge" data-sentiment={summarizeResults.summary?.sentiment_general}>
                          {summarizeResults.summary?.sentiment_general}
                        </div>
                        <div className="stat-label">Sentimiento General</div>
                      </div>
                    </div>

                    <div className="summary-item">
                      <h4>💡 Recomendaciones de Mejora</h4>
                      <ul>
                        {Array.isArray(summarizeResults.summary?.recomendacion_mejoras) ? 
                          summarizeResults.summary.recomendacion_mejoras.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          )) : 
                          <li>{summarizeResults.summary?.recomendacion_mejoras}</li>
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <BarChart3 size={48} />
                  <h3>Analiza comentarios existentes</h3>
                  <p>
                    Proporciona comentarios de clientes para obtener un resumen 
                    detallado con insights y recomendaciones.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inyectar estilos CSS específicos
const commentStyles = `
.product-comments-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-gray);
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.star-filled {
  color: #fbbf24;
  fill: #fbbf24;
}

.star-empty {
  color: #e5e7eb;
}

.rating-number {
  margin-left: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
  padding: 2rem;
  background: var(--bg-gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-gray);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.sentiment-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem !important;
  text-transform: capitalize;
  font-weight: 600 !important;
}

.sentiment-badge[data-sentiment="positivo"] {
  background: #dcfce7;
  color: #166534;
}

.sentiment-badge[data-sentiment="negativo"] {
  background: #fef2f2;
  color: #991b1b;
}

.sentiment-badge[data-sentiment="mixto"] {
  background: #fffbeb;
  color: #92400e;
}

.sentiment-badge[data-sentiment="neutro"] {
  background: var(--bg-gray-100);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = commentStyles;
  document.head.appendChild(style);
}
