import './App.css'
import ProductPage from './features/product/pages/ProductPage'
import ProductsPage from './features/product/pages/ProductsPage'
import { Route, Routes } from 'react-router-dom'

function App() {

  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  )
}

export default App;
