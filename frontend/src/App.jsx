import React, { useContext } from 'react';
import { ProductProvider, ProductContext } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ReviewModal from './components/ReviewModal';
import SearchModal from './components/SearchModal';
import SizingModal from './components/SizingModal';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import BundlePage from './pages/BundlePage';

function AppContent() {
  const { activePage, toasts } = useContext(ProductContext);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
      case 'about':
        return <Home />;
      case 'shop':
        return <Shop />;
      case 'product':
        return <ProductDetail />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <AdminDashboard />;
      case 'bundle':
        return <BundlePage />;
      default:
        return <Home />;
    }
  };

  return (
    <div>
      {/* Toast Alert Portal */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast-message">
            {t.message}
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <Header />
      
      {/* Main Pages Router */}
      <main>
        {renderPage()}
      </main>

      {/* Footer and Whatsapp widget */}
      <Footer />

      {/* Slide-out Cart Drawer and Modal Overlays */}
      <CartDrawer />
      <CheckoutModal />
      <ReviewModal />
      <SearchModal />
      <SizingModal />
    </div>
  );
}

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
