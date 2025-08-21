import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, BarChart3, Star, Calendar, ThumbsUp, ArrowLeft } from 'lucide-react';
import { commentService } from '../services/apiService';
import toast from 'react-hot-toast';
import styles from './ProductComments.module.scss';
import { useNavigate } from 'react-router-dom';

export function ProductComments() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState({ generate: false, summarize: false, autoSummarize: false });
  const [isDataFromDescription, setIsDataFromDescription] = useState(false);

  useEffect(() => {
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
          setGenerateForm(prev => ({
            ...prev,
            productName: selected.titulo || prev.productName,
            productDescription: selected.descripcion || prev.productDescription
          }));
          setSummarizeForm(prev => ({
            ...prev,
            productName: selected.titulo || prev.productName
          }));
          setIsDataFromDescription(true);
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

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

  const handleAutoSummarize = async () => {
    if (!generateResults || !generateResults.comments) {
      toast.error('No hay comentarios generados para resumir');
      return;
    }

    setLoading(prev => ({ ...prev, autoSummarize: true }));
    try {
      const data = {
        productName: generateResults.product_name,
        comments: generateResults.comments.map(comment => ({
          usuario: comment.usuario,
          calificacion: comment.calificacion,
          comentario: comment.comentario,
          fecha_relativa: comment.fecha_relativa,
          util: comment.util
        }))
      };

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
      setLoading(prev => ({ ...prev, autoSummarize: false }));
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  return (
    <div className={styles.productCommentsPage}>
      <div className="page-header">
        <h1 className="page-title">
          <MessageSquare size={32} />
          Generador de Comentarios
        </h1>
        <p className="page-description">
          Genera comentarios realistas de clientes para tus productos o resume comentarios
          existentes para obtener insights valiosos sobre la opinión de tus usuarios.
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

                  <div className={styles.formRow}>
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

                  <div className={styles.commentsList}>
                    {generateResults.comments?.map((comment, index) => (
                      <div key={index} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                          <div className={styles.commentUser}>
                            <strong>{comment.usuario}</strong>
                            <div className={styles.commentRating}>
                              {renderStars(comment.calificacion)}
                              <span className={styles.ratingNumber}>({comment.calificacion}/5)</span>
                            </div>
                          </div>
                        </div>
                        <p className={styles.commentText}>{comment.comentario}</p>
                        <div className={styles.commentMeta}>
                          <span className={styles.commentDate}>
                            <Calendar size={12} />
                            {comment.fecha_relativa}
                          </span>
                          <span className={styles.commentHelpful}>
                            <ThumbsUp size={12} />
                            {comment.util} personas encontraron esto útil
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón para resumir comentarios generados */}
                  <div className={styles.autoSummarizeSection}>
                    <button
                      onClick={handleAutoSummarize}
                      className="btn btn-success btn-lg"
                      disabled={loading.autoSummarize}
                      style={{ width: '100%' }}
                    >
                      {loading.autoSummarize ? (
                        <>
                          <div className="spinner"></div>
                          Resumiendo comentarios...
                        </>
                      ) : (
                        <>
                          <BarChart3 size={20} />
                          Resumir estos Comentarios
                        </>
                      )}
                    </button>
                    <p className={styles.autoSummarizeHelp}>
                      💡 Obtén un análisis detallado de los comentarios generados con insights y recomendaciones
                    </p>
                  </div>

                  {/* Mostrar resumen si está disponible */}
                  {summarizeResults && (
                    <div className={styles.summarySection}>
                      <div className={styles.summaryHeader}>
                        <h2 className={styles.summaryTitle}>
                          <BarChart3 size={24} />
                          Análisis de Comentarios
                        </h2>
                        <p className={styles.summaryDescription}>
                          Análisis de {summarizeResults.total_comments_analyzed} comentarios para "{summarizeResults.product_name}"
                        </p>
                      </div>

                      <div className={styles.summaryContent}>
                        <div className={styles.summaryItem}>
                          <h4>📋 Resumen General</h4>
                          <p>{summarizeResults.summary?.resumen_general}</p>
                        </div>

                        <div className={styles.summaryItem}>
                          <h4>✅ Aspectos Positivos</h4>
                          {Array.isArray(summarizeResults.summary?.aspectos_positivos) ? (
                            <ul>
                              {summarizeResults.summary.aspectos_positivos.map((aspect, index) => (
                                <li key={index}>{aspect}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{summarizeResults.summary?.aspectos_positivos}</p>
                          )}
                        </div>

                        <div className={styles.summaryItem}>
                          <h4>⚠️ Aspectos Negativos</h4>
                          {Array.isArray(summarizeResults.summary?.aspectos_negativos) ? (
                            <ul>
                              {summarizeResults.summary.aspectos_negativos.map((aspect, index) => (
                                <li key={index}>{aspect}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{summarizeResults.summary?.aspectos_negativos}</p>
                          )}
                        </div>

                        <div className={styles.summaryStats}>
                          <div className={styles.statItem}>
                            <div className={styles.statValue}>
                              {summarizeResults.summary?.calificacion_promedio}/5
                            </div>
                            <div className={styles.statLabel}>Calificación Promedio</div>
                            <div className={styles.statStars}>
                              {renderStars(Math.round(summarizeResults.summary?.calificacion_promedio || 0))}
                            </div>
                            {summarizeResults.summary?.estadisticas_detalladas && (
                              <div className={styles.statDetail}>
                                {summarizeResults.summary.estadisticas_detalladas.total_calificaciones > 0 ? (
                                  <>Basado en {summarizeResults.summary.estadisticas_detalladas.total_calificaciones} calificaciones</>
                                ) : (
                                  <>Estimado por IA (sin calificaciones numéricas)</>
                                )}
                              </div>
                            )}
                          </div>

                          <div className={styles.statItem}>
                            <div className={styles.sentimentBadge} data-sentiment={summarizeResults.summary?.sentiment_general}>
                              {summarizeResults.summary?.sentiment_general}
                            </div>
                            <div className={styles.statLabel}>Sentimiento General</div>
                          </div>
                        </div>

                        {/* Mostrar distribución de calificaciones si está disponible */}
                        {summarizeResults.summary?.estadisticas_detalladas?.total_calificaciones > 0 && (
                          <div className={styles.summaryItem}>
                            <h4>📊 Distribución de Calificaciones</h4>
                            <div className={styles.ratingDistribution}>
                              {[5, 4, 3, 2, 1].map(rating => {
                                const count = summarizeResults.summary.estadisticas_detalladas.distribucion_calificaciones[rating] || 0;
                                const percentage = summarizeResults.summary.estadisticas_detalladas.total_calificaciones > 0 ?
                                  Math.round((count / summarizeResults.summary.estadisticas_detalladas.total_calificaciones) * 100) : 0;
                                return (
                                  <div key={rating} className={styles.ratingBar}>
                                    <span className={styles.ratingLabel}>{rating} ⭐</span>
                                    <div className={styles.ratingBarContainer}>
                                      <div
                                        className={styles.ratingBarFill}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className={styles.ratingCount}>{count} ({percentage}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className={styles.summaryItem}>
                          <h4>💡 Recomendaciones de Mejora</h4>
                          {Array.isArray(summarizeResults.summary?.recomendacion_mejoras) ? (
                            <ul>
                              {summarizeResults.summary.recomendacion_mejoras.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{summarizeResults.summary?.recomendacion_mejoras}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
                <div className={styles.summarySection}>
                  <div className={styles.summaryHeader}>
                    <h2 className={styles.summaryTitle}>
                      <BarChart3 size={24} />
                      Resumen de Análisis
                    </h2>
                    <p className={styles.summaryDescription}>
                      Análisis de {summarizeResults.total_comments_analyzed} comentarios para "{summarizeResults.product_name}"
                    </p>
                  </div>

                  <div className={styles.summaryContent}>
                    <div className={styles.summaryItem}>
                      <h4>📋 Resumen General</h4>
                      <p>{summarizeResults.summary?.resumen_general}</p>
                    </div>

                    <div className={styles.summaryItem}>
                      <h4>✅ Aspectos Positivos</h4>
                      {Array.isArray(summarizeResults.summary?.aspectos_positivos) ? (
                        <ul>
                          {summarizeResults.summary.aspectos_positivos.map((aspect, index) => (
                            <li key={index}>{aspect}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{summarizeResults.summary?.aspectos_positivos}</p>
                      )}
                    </div>

                    <div className={styles.summaryItem}>
                      <h4>⚠️ Aspectos Negativos</h4>
                      {Array.isArray(summarizeResults.summary?.aspectos_negativos) ? (
                        <ul>
                          {summarizeResults.summary.aspectos_negativos.map((aspect, index) => (
                            <li key={index}>{aspect}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{summarizeResults.summary?.aspectos_negativos}</p>
                      )}
                    </div>

                    <div className={styles.summaryStats}>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>
                          {summarizeResults.summary?.calificacion_promedio}/5
                        </div>
                        <div className={styles.statLabel}>Calificación Promedio</div>
                        <div className={styles.statStars}>
                          {renderStars(Math.round(summarizeResults.summary?.calificacion_promedio || 0))}
                        </div>
                        {summarizeResults.summary?.estadisticas_detalladas && (
                          <div className={styles.statDetail}>
                            {summarizeResults.summary.estadisticas_detalladas.total_calificaciones > 0 ? (
                              <>Basado en {summarizeResults.summary.estadisticas_detalladas.total_calificaciones} calificaciones</>
                            ) : (
                              <>Estimado por IA (sin calificaciones numéricas)</>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={styles.statItem}>
                        <div className={styles.sentimentBadge} data-sentiment={summarizeResults.summary?.sentiment_general}>
                          {summarizeResults.summary?.sentiment_general}
                        </div>
                        <div className={styles.statLabel}>Sentimiento General</div>
                      </div>
                    </div>

                    {/* Mostrar distribución de calificaciones si está disponible */}
                    {summarizeResults.summary?.estadisticas_detalladas?.total_calificaciones > 0 && (
                      <div className={styles.summaryItem}>
                        <h4>📊 Distribución de Calificaciones</h4>
                        <div className={styles.ratingDistribution}>
                          {[5, 4, 3, 2, 1].map(rating => {
                            const count = summarizeResults.summary.estadisticas_detalladas.distribucion_calificaciones[rating] || 0;
                            const percentage = summarizeResults.summary.estadisticas_detalladas.total_calificaciones > 0 ?
                              Math.round((count / summarizeResults.summary.estadisticas_detalladas.total_calificaciones) * 100) : 0;
                            return (
                              <div key={rating} className={styles.ratingBar}>
                                <span className={styles.ratingLabel}>{rating} ⭐</span>
                                <div className={styles.ratingBarContainer}>
                                  <div
                                    className={styles.ratingBarFill}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className={styles.ratingCount}>{count} ({percentage}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className={styles.summaryItem}>
                      <h4>💡 Recomendaciones de Mejora</h4>
                      {Array.isArray(summarizeResults.summary?.recomendacion_mejoras) ? (
                        <ul>
                          {summarizeResults.summary.recomendacion_mejoras.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{summarizeResults.summary?.recomendacion_mejoras}</p>
                      )}
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

