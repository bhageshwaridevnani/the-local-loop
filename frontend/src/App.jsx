import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Shops from './pages/Shops';
import ShopDetails from './pages/ShopDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import VendorDashboard from './pages/vendor/VendorDashboard';
import ProductManagement from './pages/vendor/ProductManagement';
import VendorOrders from './pages/vendor/VendorOrders';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Customer Routes */}
              <Route path="/shops" element={
                <ProtectedRoute>
                  <Shops />
                </ProtectedRoute>
              } />
              
              <Route path="/shops/:id" element={
                <ProtectedRoute>
                  <ShopDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              
              {/* Vendor Routes */}
              <Route path="/vendor/dashboard" element={
                <ProtectedRoute>
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/vendor/products" element={
                <ProtectedRoute>
                  <ProductManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/vendor/orders" element={
                <ProtectedRoute>
                  <VendorOrders />
                </ProtectedRoute>
              } />
              
              {/* Delivery Partner Routes */}
              <Route path="/delivery/dashboard" element={
                <ProtectedRoute>
                  <DeliveryDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

