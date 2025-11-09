import './App.css'
import PageLayout from './shared/layouts/PageLayout'
import ProductsPage from './features/product/pages/ProductsPage'

function App() {
  return (
    <PageLayout title="Credit Payment">
      <ProductsPage />
    </PageLayout>
  )
}

export default App
