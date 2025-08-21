import { useState, useEffect } from 'react';
import { BookOpen, Server, Code, Copy } from 'lucide-react';
import { generalService } from '../services/apiService';
import toast from 'react-hot-toast';

export function ApiDocs() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const response = await generalService.getEndpointDocs();
      setDocs(response);
    } catch (error) {
      console.error('Error loading docs:', error);
      toast.error('Error al cargar la documentación');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Código copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el código');
    }
  };

  if (loading) {
    return (
      <div className="api-docs-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Cargando documentación...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="api-docs-page">
      <div className="page-header">
        <h1 className="page-title">
          <BookOpen size={32} />
          Documentación de API
        </h1>
        <p className="page-description">
          Documentación completa de los endpoints disponibles para integrar 
          la API de generación de contenido en tus aplicaciones.
        </p>
      </div>

      <div className="docs-content">
        <div className="overview-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Server size={24} />
                Información General
              </h2>
            </div>
            
            <div className="api-info">
              <div className="info-item">
                <label>Base URL:</label>
                <code>http://localhost:3000/api</code>
              </div>
              <div className="info-item">
                <label>Formato de Respuesta:</label>
                <code>application/json</code>
              </div>
              <div className="info-item">
                <label>Autenticación:</label>
                <span>No requerida</span>
              </div>
            </div>

            <div className="quick-start">
              <h3>🚀 Inicio Rápido</h3>
              <div className="code-block">
                <div className="code-header">
                  <span>JavaScript / Fetch</span>
                  <button 
                    onClick={() => copyCode(`fetch('http://localhost:3000/api/chat/generate-detailed-product-info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productName: 'Mi Producto',
    productAditionalInfo: 'Información adicional del producto'
  })
})
.then(response => response.json())
.then(data => console.log(data));`)}
                    className="copy-btn"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <pre>{`fetch('http://localhost:3000/api/chat/generate-detailed-product-info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productName: 'Mi Producto',
    productAditionalInfo: 'Información adicional del producto'
  })
})
.then(response => response.json())
.then(data => console.log(data));`}</pre>
              </div>
            </div>
          </div>
        </div>

        {docs?.images && (
          <div className="endpoints-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Code size={24} />
                  API de Imágenes
                </h2>
                <p className="card-description">{docs.images.data.description}</p>
              </div>

              <div className="endpoints-list">
                {docs.images.data.endpoints?.map((endpoint, index) => (
                  <div key={index} className="endpoint-item">
                    <div className="endpoint-header">
                      <span className={`method method-${endpoint.method.toLowerCase()}`}>
                        {endpoint.method}
                      </span>
                      <code className="endpoint-path">{endpoint.path}</code>
                    </div>
                    
                    <p className="endpoint-description">{endpoint.description}</p>
                    
                    {endpoint.example_body && (
                      <div className="code-block">
                        <div className="code-header">
                          <span>Ejemplo de Request Body</span>
                          <button 
                            onClick={() => copyCode(JSON.stringify(endpoint.example_body, null, 2))}
                            className="copy-btn"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <pre>{JSON.stringify(endpoint.example_body, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {docs.images.data.available_styles && (
                <div className="additional-info">
                  <h4>Estilos Disponibles</h4>
                  <div className="tags">
                    {docs.images.data.available_styles.map(style => (
                      <span key={style} className="tag">{style}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {docs?.comments && (
          <div className="endpoints-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Code size={24} />
                  API de Comentarios
                </h2>
                <p className="card-description">{docs.comments.data.description}</p>
              </div>

              <div className="endpoints-list">
                {docs.comments.data.endpoints?.map((endpoint, index) => (
                  <div key={index} className="endpoint-item">
                    <div className="endpoint-header">
                      <span className={`method method-${endpoint.method.toLowerCase()}`}>
                        {endpoint.method}
                      </span>
                      <code className="endpoint-path">{endpoint.path}</code>
                    </div>
                    
                    <p className="endpoint-description">{endpoint.description}</p>
                    
                    {endpoint.example_body && (
                      <div className="code-block">
                        <div className="code-header">
                          <span>Ejemplo de Request</span>
                          <button 
                            onClick={() => copyCode(JSON.stringify(endpoint.example_body, null, 2))}
                            className="copy-btn"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <pre>{JSON.stringify(endpoint.example_body, null, 2)}</pre>
                      </div>
                    )}

                    {endpoint.response_example && (
                      <div className="code-block">
                        <div className="code-header">
                          <span>Ejemplo de Response</span>
                          <button 
                            onClick={() => copyCode(JSON.stringify(endpoint.response_example, null, 2))}
                            className="copy-btn"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <pre>{JSON.stringify(endpoint.response_example, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {docs.comments.data.limits && (
                <div className="additional-info">
                  <h4>Límites</h4>
                  <div className="limits-list">
                    {Object.entries(docs.comments.data.limits).map(([key, value]) => (
                      <div key={key} className="limit-item">
                        <span className="limit-label">{key.replace(/_/g, ' ')}:</span>
                        <span className="limit-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const docsStyles = `
.api-docs-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--text-secondary);
}

.docs-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.api-info {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-item label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 150px;
}

.info-item code {
  background: var(--bg-gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.quick-start h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.code-block {
  position: relative;
  background: #1e1e1e;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin: 1rem 0;
}

.code-header {
  background: #2d2d2d;
  color: #fff;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.copy-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: background 0.2s ease;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.code-block pre {
  background: transparent;
  color: #f8f8f2;
  padding: 1rem;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
}

.endpoints-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.endpoint-item {
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  background: var(--bg-gray-50);
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.method {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.method-post {
  background: #16a34a;
  color: white;
}

.method-get {
  background: #2563eb;
  color: white;
}

.endpoint-path {
  background: var(--bg-white);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  border: 1px solid var(--border-gray);
}

.endpoint-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.additional-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-gray);
}

.additional-info h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.limits-list {
  display: grid;
  gap: 0.5rem;
}

.limit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.limit-label {
  color: var(--text-secondary);
  text-transform: capitalize;
}

.limit-value {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .api-docs-page {
    padding: 1rem;
  }
  
  .endpoint-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-item label {
    min-width: auto;
  }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = docsStyles;
  document.head.appendChild(style);
}
