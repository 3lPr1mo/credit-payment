import './App.css'
import CustomerPage from './features/product/pages/CustomerPage'
import ProductPage from './features/product/pages/ProductPage'
import ProductsPage from './features/product/pages/ProductsPage'
import { Route, Routes } from 'react-router-dom'

function App() {

  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/customer" element={<CustomerPage />} />
    </Routes>
  )
}

export default App;
