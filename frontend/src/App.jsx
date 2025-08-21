import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { ProductDescriptions } from './pages/ProductDescriptions'
import { ProductImages } from './pages/ProductImages'
import { ProductComments } from './pages/ProductComments'
import { ApiDocs } from './pages/ApiDocs'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/descriptions" element={<ProductDescriptions />} />
            <Route path="/images" element={<ProductImages />} />
            <Route path="/comments" element={<ProductComments />} />
            <Route path="/docs" element={<ApiDocs />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
