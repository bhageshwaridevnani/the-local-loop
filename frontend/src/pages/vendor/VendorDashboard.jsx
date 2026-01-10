import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Package, ShoppingBag, DollarSign, TrendingUp, Plus, List, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    totalRevenue: 0,
    completedOrders: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopStatus, setShopStatus] = useState(true);
  const [acceptingOrders, setAcceptingOrders] = useState(true);

  useEffect(() => {
    if (user?.role !== 'VENDOR') {
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch products
      const productsRes = await axios.get('/api/products/vendor/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(productsRes.data.products.slice(0, 5)); // Get latest 5
      
      // Fetch orders (when API is ready)
      // const ordersRes = await axios.get('/api/orders/vendor/my-orders', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setOrders(ordersRes.data.orders.slice(0, 5));
      
      // Calculate stats
      setStats({
        totalProducts: productsRes.data.count,
        activeOrders: 0, // Will be updated when orders API is ready
        totalRevenue: 0,
        completedOrders: 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShopStatus = () => {
    setShopStatus(!shopStatus);
    toast.success(`Shop ${!shopStatus ? 'opened' : 'closed'} successfully`);
  };

  const handleToggleOrderAcceptance = () => {
    setAcceptingOrders(!acceptingOrders);
    toast.success(`Order acceptance ${!acceptingOrders ? 'enabled' : 'disabled'}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>

        {/* Shop Status Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shop Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {shopStatus ? 'Your shop is currently open' : 'Your shop is currently closed'}
                </p>
              </div>
              <button
                onClick={handleToggleShopStatus}
                className="flex items-center gap-2"
              >
                {shopStatus ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <ToggleRight className="h-10 w-10" />
                    <span className="font-semibold">Open</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <ToggleLeft className="h-10 w-10" />
                    <span className="font-semibold">Closed</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Acceptance</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {acceptingOrders ? 'Accepting new orders' : 'Not accepting orders'}
                </p>
              </div>
              <button
                onClick={handleToggleOrderAcceptance}
                className="flex items-center gap-2"
              >
                {acceptingOrders ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <ToggleRight className="h-10 w-10" />
                    <span className="font-semibold">On</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <ToggleLeft className="h-10 w-10" />
                    <span className="font-semibold">Off</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
            <p className="text-sm text-gray-500 mt-2">Active in catalog</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Active Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Pending fulfillment</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue}</p>
            <p className="text-sm text-gray-500 mt-2">All time earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Completed Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Successfully delivered</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/vendor/products')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Product</h3>
                <p className="text-sm text-gray-600">Add new items to your catalog</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/vendor/products')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <List className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Products</h3>
                <p className="text-sm text-gray-600">Edit or remove products</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/vendor/orders')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Orders</h3>
                <p className="text-sm text-gray-600">Manage incoming orders</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
            <button
              onClick={() => navigate('/vendor/products')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No products yet</p>
              <button
                onClick={() => navigate('/vendor/products')}
                className="btn-primary"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.brand}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{product.category}</td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">₹{product.price}</td>
                      <td className="py-3 px-4">
                        <span className={`${product.stock > 10 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                          {product.stock} {product.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-500 mt-2">Orders will appear here when customers place them</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;

