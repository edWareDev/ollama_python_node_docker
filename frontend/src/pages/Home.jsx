import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  FileText, 
  Image, 
  MessageSquare, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Server
} from 'lucide-react';
import { generalService } from '../services/apiService';
import toast from 'react-hot-toast';

export function Home() {
  const [serviceHealth, setServiceHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    try {
      setLoading(true);
      const health = await generalService.checkHealth();
      setServiceHealth(health);
    } catch (error) {
      console.error('Error checking service health:', error);
      setServiceHealth({ api_accessible: false, error: error.message });
      toast.error('Error al verificar el estado de los servicios');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FileText,
      title: 'Descripciones de Productos',
      description: 'Genera títulos comerciales atractivos y descripciones detalladas para tus productos usando IA.',
      link: '/descriptions',
      color: 'var(--primary-color)'
    },
    {
      icon: Image,
      title: 'Imágenes Promocionales',
      description: 'Crea imágenes profesionales para tus productos con diferentes estilos y configuraciones.',
      link: '/images',
      color: 'var(--success-color)'
    },
    {
      icon: MessageSquare,
      title: 'Comentarios de Productos',
      description: 'Genera comentarios realistas de clientes y resume opiniones existentes para obtener insights.',
      link: '/comments',
      color: 'var(--warning-color)'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Bot size={64} />
          </div>
          <h1 className="hero-title">
            Generador de Contenido para Productos
            <span className="hero-accent">con IA</span>
          </h1>
          <p className="hero-description">
            Potencia tu negocio con inteligencia artificial. Genera descripciones atractivas, 
            imágenes profesionales y comentarios realistas para tus productos de forma automática.
          </p>
          <div className="hero-actions">
            <Link to="/descriptions" className="btn btn-primary btn-lg">
              <Zap size={20} />
              Comenzar Ahora
            </Link>
            <Link to="/docs" className="btn btn-secondary btn-lg">
              <Server size={20} />
              Ver API
            </Link>
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="status-section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Server size={24} />
              Estado de los Servicios
            </h2>
            <p className="card-description">
              Verifica que todos los servicios estén funcionando correctamente.
            </p>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Verificando servicios...</span>
            </div>
          ) : (
            <div className="status-grid">
              <div className={`status-item ${serviceHealth?.api_accessible ? 'success' : 'error'}`}>
                {serviceHealth?.api_accessible ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <div className="status-info">
                  <span className="status-label">API Principal</span>
                  <span className="status-value">
                    {serviceHealth?.api_accessible ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>

              {serviceHealth?.services && Object.entries(serviceHealth.services).map(([service, status]) => (
                <div key={service} className={`status-item ${status ? 'success' : 'error'}`}>
                  {status ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <div className="status-info">
                    <span className="status-label">
                      {service === 'images' ? 'Imágenes' : 
                       service === 'comments' ? 'Comentarios' : 
                       'General'}
                    </span>
                    <span className="status-value">
                      {status ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {serviceHealth && !serviceHealth.api_accessible && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <div>
                <strong>Error de conexión:</strong> {serviceHealth.error}
                <br />
                <small>Asegúrate de que el servidor backend esté ejecutándose en el puerto 3000.</small>
              </div>
            </div>
          )}

          <button 
            onClick={checkServiceHealth} 
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Verificando...
              </>
            ) : (
              <>
                <Server size={16} />
                Verificar Nuevamente
              </>
            )}
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Funcionalidades Disponibles</h2>
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.link} className="feature-card">
                <div className="feature-icon" style={{ color: feature.color }}>
                  <Icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Getting Started */}
      <section className="getting-started">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Zap size={24} />
              Cómo Empezar
            </h2>
          </div>
          
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Elige una Funcionalidad</h4>
                <p>Selecciona si quieres generar descripciones, imágenes o comentarios para tus productos.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Completa la Información</h4>
                <p>Proporciona los datos básicos de tu producto como nombre, descripción y configuraciones.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Genera y Descarga</h4>
                <p>La IA procesará tu solicitud y podrás descargar o copiar los resultados generados.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Estilos específicos para la página Home
const homeStyles = `
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 4rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-accent {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  margin-top: 0.5rem;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.status-section {
  margin-bottom: 4rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-gray);
  background: var(--bg-gray-50);
}

.status-item.success {
  border-color: var(--success-color);
  background: #dcfce7;
  color: var(--success-color);
}

.status-item.error {
  border-color: var(--error-color);
  background: #fef2f2;
  color: var(--error-color);
}

.status-info {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.8;
}

.status-value {
  font-size: 0.875rem;
  font-weight: 500;
}

.features-section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-white);
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.feature-icon {
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-arrow {
  font-size: 1.5rem;
  color: var(--primary-color);
  font-weight: 700;
  position: absolute;
  bottom: 1.5rem;
  right: 2rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

.getting-started {
  margin-bottom: 2rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.step-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.step-content p {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .home-page {
    padding: 1rem;
  }
  
  .hero {
    padding: 2rem 0;
    margin-bottom: 2rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
  }
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = homeStyles;
  document.head.appendChild(style);
}
