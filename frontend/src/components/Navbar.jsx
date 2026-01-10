import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">The Local Loop</span>
          </Link>

          {/* Navigation Links - Role Based */}
          <div className="hidden md:flex items-center space-x-6">
            {user?.role === 'CUSTOMER' && (
              <Link to="/shops" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Browse Shops
              </Link>
            )}
            
            {user?.role === 'VENDOR' && (
              <>
                <Link to="/vendor/products" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  My Products
                </Link>
                <Link to="/vendor/orders" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Orders
                </Link>
              </>
            )}
            
            {(user?.role === 'CUSTOMER' || user?.role === 'VENDOR') && (
              <Link to="/orders" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                My Orders
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart - Only for Customers */}
            {user?.role === 'CUSTOMER' && (
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-primary-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

