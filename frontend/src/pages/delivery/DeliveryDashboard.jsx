import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DeliveryDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    vehicleType: '',
    vehicleNumber: '',
    availableFrom: '09:00',
    availableTo: '21:00'
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchProfile(),
      fetchPendingRequests(),
      fetchActiveDeliveries(),
      fetchEarnings()
    ]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        setProfileForm({
          vehicleType: data.profile.vehicleType || '',
          vehicleNumber: data.profile.vehicleNumber || '',
          availableFrom: data.profile.availableFrom || '09:00',
          availableTo: data.profile.availableTo || '21:00'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/requests/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchActiveDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setActiveDeliveries(data.deliveries || []);
      }
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
    }
  };

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setEarnings(data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isAvailable: !profile?.isAvailable
        })
      });
      
      if (response.ok) {
        await fetchProfile();
        await fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    console.log('Updating profile with data:', profileForm);
    console.log('API URL:', API_URL);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        return;
      }
      
      console.log('Sending PUT request to:', `${API_URL}/api/delivery/profile`);
      
      const response = await fetch(`${API_URL}/api/delivery/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile updated successfully:', data);
        await fetchProfile();
        setShowProfileModal(false);
        alert('Profile updated successfully!');
      } else {
        const data = await response.json();
        console.error('Update profile error response:', data);
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile (catch block):', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert('Failed to update profile: ' + error.message + '\n\nCheck console for details.');
    }
  };

  const acceptDelivery = async (deliveryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/requests/${deliveryId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Delivery accepted successfully!');
        await fetchAllData();
        setSelectedRequest(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept delivery');
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
      alert('Failed to accept delivery');
    }
  };

  const rejectDelivery = async (deliveryId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/requests/${deliveryId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        alert('Delivery rejected');
        await fetchAllData();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      alert('Failed to reject delivery');
    }
  };

  const markAsPickedUp = async (deliveryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/${deliveryId}/pickup`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Marked as picked up!');
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error marking as picked up:', error);
      alert('Failed to update status');
    }
  };

  const completeDelivery = async (deliveryId) => {
    const paymentReceived = window.confirm('Has the customer paid (COD)?');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/delivery/${deliveryId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentReceived })
      });
      
      if (response.ok) {
        alert('Delivery completed! ₹10 earned.');
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert('Failed to complete delivery');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Availability Toggle */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Edit Profile
              </button>
              <button
                onClick={toggleAvailability}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  profile?.isAvailable
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                {profile?.isAvailable ? '🟢 Available' : '⚫ Offline'}
              </button>
            </div>
          </div>
          
          {profile && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Rating:</span>
                <span className="ml-2 font-semibold">⭐ {profile.rating.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Deliveries:</span>
                <span className="ml-2 font-semibold">{profile.totalDeliveries}</span>
              </div>
              <div>
                <span className="text-gray-600">Vehicle:</span>
                <span className="ml-2 font-semibold">{profile.vehicleType || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-600">Working Hours:</span>
                <span className="ml-2 font-semibold">
                  {profile.availableFrom || '09:00'} - {profile.availableTo || '21:00'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Today's Earnings</h3>
            <p className="text-3xl font-bold">₹{earnings?.todayEarnings || 0}</p>
            <p className="text-sm mt-2 opacity-90">{earnings?.todayDeliveries || 0} deliveries</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold">₹{earnings?.totalEarnings || 0}</p>
            <p className="text-sm mt-2 opacity-90">{earnings?.totalDeliveries || 0} total</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold">{pendingRequests.length}</p>
            <p className="text-sm mt-2 opacity-90">Waiting for you</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Active Deliveries</h3>
            <p className="text-3xl font-bold">{activeDeliveries.length}</p>
            <p className="text-sm mt-2 opacity-90">In progress</p>
          </div>
        </div>

        {/* Active Deliveries Section */}
        {activeDeliveries.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">🚚 Active Deliveries</h2>
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pickup Info */}
                    <div className="border-r pr-4">
                      <h3 className="font-semibold text-green-600 mb-2">📦 PICKUP FROM</h3>
                      <p className="font-bold">{delivery.order.vendor.shopName}</p>
                      <p className="text-sm text-gray-600">{delivery.order.vendor.address}</p>
                      <p className="text-sm mt-2">
                        📞 <a href={`tel:${delivery.order.vendor.user.phone}`} className="text-blue-600 hover:underline">
                          {delivery.order.vendor.user.phone}
                        </a>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Contact: {delivery.order.vendor.user.name}
                      </p>
                    </div>

                    {/* Delivery Info */}
                    <div className="border-r pr-4">
                      <h3 className="font-semibold text-blue-600 mb-2">🏠 DELIVER TO</h3>
                      <p className="font-bold">{delivery.order.customer.name}</p>
                      <p className="text-sm text-gray-600">{delivery.order.deliveryAddress}</p>
                      <p className="text-sm mt-2">
                        📞 <a href={`tel:${delivery.order.customer.phone}`} className="text-blue-600 hover:underline">
                          {delivery.order.customer.phone}
                        </a>
                      </p>
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        💰 Collect: ₹{delivery.order.totalAmount + delivery.order.deliveryFee}
                      </p>
                    </div>

                    {/* Order Details & Actions */}
                    <div>
                      <h3 className="font-semibold mb-2">📋 Order Details</h3>
                      <p className="text-sm">
                        <span className="font-semibold">Items:</span> {delivery.order.items.length}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Your Earning:</span> ₹{delivery.order.deliveryFee}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`px-2 py-1 rounded text-xs ${
                          delivery.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-800' :
                          delivery.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.status}
                        </span>
                      </p>

                      <div className="mt-4 space-y-2">
                        {delivery.status === 'ACCEPTED' && (
                          <button
                            onClick={() => markAsPickedUp(delivery.id)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            ✓ Mark as Picked Up
                          </button>
                        )}
                        {delivery.status === 'PICKED_UP' && (
                          <button
                            onClick={() => completeDelivery(delivery.id)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            ✓ Complete Delivery
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Items to Deliver:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {delivery.order.items.map((item) => (
                        <div key={item.id} className="text-sm bg-gray-50 p-2 rounded">
                          <p className="font-semibold">{item.product.name}</p>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">📬 Pending Delivery Requests</h2>
          
          {!profile?.isAvailable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                ⚠️ You are currently offline. Turn on availability to see delivery requests.
              </p>
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl mb-2">📭</p>
              <p>No pending delivery requests at the moment</p>
              <p className="text-sm mt-2">
                {profile?.isAvailable ? 'Check back soon!' : 'Turn on availability to receive requests'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">New Request</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                      ₹{request.order.deliveryFee}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Pickup:</p>
                      <p className="font-semibold">{request.order.vendor.shopName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deliver to:</p>
                      <p className="font-semibold">{request.order.customer.name}</p>
                      <p className="text-xs text-gray-500">{request.order.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Items: {request.order.items.length}</p>
                      <p className="text-gray-600">Total: ₹{request.order.totalAmount}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptDelivery(request.id);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectDelivery(request.id);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Delivery Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Pickup Details */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-lg mb-2">📦 Pickup Location</h3>
                  <p className="font-semibold text-lg">{selectedRequest.order.vendor.shopName}</p>
                  <p className="text-gray-600">{selectedRequest.order.vendor.address}</p>
                  <p className="mt-2">
                    Contact: {selectedRequest.order.vendor.user.name}
                  </p>
                  <p className="text-blue-600">
                    📞 <a href={`tel:${selectedRequest.order.vendor.user.phone}`}>
                      {selectedRequest.order.vendor.user.phone}
                    </a>
                  </p>
                </div>

                {/* Delivery Details */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-lg mb-2">🏠 Delivery Location</h3>
                  <p className="font-semibold text-lg">{selectedRequest.order.customer.name}</p>
                  <p className="text-gray-600">{selectedRequest.order.deliveryAddress}</p>
                  <p className="text-blue-600 mt-2">
                    📞 <a href={`tel:${selectedRequest.order.customer.phone}`}>
                      {selectedRequest.order.customer.phone}
                    </a>
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-lg mb-2">📋 Items to Deliver</h3>
                  <div className="space-y-2">
                    {selectedRequest.order.items.map((item) => (
                      <div key={item.id} className="flex justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-semibold">{item.product.name}</p>
                          {item.product.brand && (
                            <p className="text-sm text-gray-600">{item.product.brand}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">💰 Payment Information</h3>
                  <div className="space-y-1">
                    <p>Order Total: ₹{selectedRequest.order.totalAmount}</p>
                    <p>Delivery Fee: ₹{selectedRequest.order.deliveryFee}</p>
                    <p className="font-bold text-lg">
                      Collect from Customer: ₹{selectedRequest.order.totalAmount + selectedRequest.order.deliveryFee}
                    </p>
                    <p className="text-green-600 font-semibold">
                      Your Earning: ₹{selectedRequest.order.deliveryFee}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => acceptDelivery(selectedRequest.id)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✓ Accept Delivery
                  </button>
                  <button
                    onClick={() => rejectDelivery(selectedRequest.id)}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                  <select
                    value={profileForm.vehicleType}
                    onChange={(e) => setProfileForm({...profileForm, vehicleType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select vehicle</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={profileForm.vehicleNumber}
                    onChange={(e) => setProfileForm({...profileForm, vehicleNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., DL01AB1234"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Available From</label>
                    <input
                      type="time"
                      value={profileForm.availableFrom}
                      onChange={(e) => setProfileForm({...profileForm, availableFrom: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Available To</label>
                    <input
                      type="time"
                      value={profileForm.availableTo}
                      onChange={(e) => setProfileForm({...profileForm, availableTo: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryDashboard;

