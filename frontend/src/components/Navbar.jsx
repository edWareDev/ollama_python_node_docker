import { Link, useLocation } from 'react-router-dom';
import { Bot, Home, FileText, Image, MessageSquare, BookOpen } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/descriptions', label: 'Descripciones', icon: FileText },
    { path: '/images', label: 'Imágenes', icon: Image },
    { path: '/comments', label: 'Comentarios', icon: MessageSquare },
    { path: '/docs', label: 'API Docs', icon: BookOpen },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Bot size={24} />
          <span>Generador IA</span>
        </Link>
        
        <div className="navbar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Estilos adicionales para el navbar
const navbarStyles = `
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-gray);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1rem 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
}

.navbar-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.2s ease-in-out;
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--bg-gray-100);
  color: var(--text-primary);
}

.nav-link.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--text-white);
}

.nav-label {
  display: block;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }
  
  .navbar-nav {
    gap: 0.25rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .nav-label {
    display: none;
  }
}
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = navbarStyles;
  document.head.appendChild(style);
}
