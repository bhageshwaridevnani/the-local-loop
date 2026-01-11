import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Save, Edit2, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Parse address into components
  const parseAddress = (address) => {
    if (!address) return { mainAddress: '', landmark: '', city: '', pincode: '' };
    
    // Try to parse format: "mainAddress, landmark, city - pincode"
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1];
      const cityPincode = lastPart.split('-').map(p => p.trim());
      
      return {
        mainAddress: parts.slice(0, -2).join(', '),
        landmark: parts[parts.length - 2] || '',
        city: cityPincode[0] || '',
        pincode: cityPincode[1] || ''
      };
    }
    
    // Fallback: treat entire address as mainAddress
    return { mainAddress: address, landmark: '', city: '', pincode: '' };
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    mainAddress: '',
    landmark: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      const addressParts = parseAddress(user.address);
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        ...addressParts
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for pincode - only digits
    if (name === 'pincode') {
      if (value === '' || /^\d{0,6}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine address fields
      const fullAddress = `${formData.mainAddress}, ${formData.landmark}, ${formData.city} - ${formData.pincode}`;
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: fullAddress
      };

      const token = localStorage.getItem('token');
      const response = await axios.put('/api/auth/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user in context
      updateUser(response.data.user);
      
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    const addressParts = parseAddress(user.address);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      ...addressParts
    });
    setEditing(false);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Card */}
          <div className="card">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600" />
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!editing}
                      required
                      className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                        pattern="[0-9]{10}"
                        className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="input-field bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  Address Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Address (House No., Street, Area)
                    </label>
                    <textarea
                      name="mainAddress"
                      value={formData.mainAddress}
                      onChange={handleChange}
                      disabled={!editing}
                      required
                      rows="2"
                      className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                      placeholder="e.g., 123, Main Street, Satellite Area"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                        className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                        placeholder="e.g., Near City Mall"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                        className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                        placeholder="e.g., Ahmedabad"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={!editing}
                      required
                      maxLength="6"
                      className={`input-field ${!editing ? 'bg-gray-50' : ''}`}
                      placeholder="e.g., 380015"
                    />
                    <p className="text-xs text-gray-500 mt-1">6-digit pincode</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Account Info */}
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-semibold text-gray-900">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-semibold text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
