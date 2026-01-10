import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user role
    if (user?.role === 'CUSTOMER') {
      navigate('/shops');
    } else if (user?.role === 'VENDOR') {
      navigate('/vendor/dashboard');
    } else if (user?.role === 'DELIVERY') {
      navigate('/delivery/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">
            Dashboard
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
            <p className="text-gray-600 mb-4">
              {user?.role === 'VENDOR' 
                ? 'Manage your products, view orders, and track your sales.'
                : 'View available deliveries, track your earnings, and manage your delivery status.'}
            </p>
          </div>

          {user?.role === 'VENDOR' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600 mt-2">Add your first product</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Active Orders</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600 mt-2">No pending orders</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">₹0</p>
                <p className="text-sm text-gray-600 mt-2">Start selling today</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Available Deliveries</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600 mt-2">No deliveries available</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Completed Today</h3>
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600 mt-2">Start delivering</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Today's Earnings</h3>
                <p className="text-3xl font-bold text-purple-600">₹0</p>
                <p className="text-sm text-gray-600 mt-2">Complete deliveries to earn</p>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">🚧 Under Development</h3>
            <p className="text-yellow-700">
              This dashboard is currently being developed. Full functionality will be available soon!
            </p>
            <p className="text-sm text-yellow-600 mt-2">
              Features coming: Product management, order tracking, analytics, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

