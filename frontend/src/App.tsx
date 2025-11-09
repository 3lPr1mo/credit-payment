import './App.css'
import PageLayout from './shared/layouts/PageLayout'
import ProductPage from './features/product/pages/ProductPage'

function App() {
  return (
    <PageLayout title="Credit Payment">
      <ProductPage />
    </PageLayout>
  )
}

export default App
