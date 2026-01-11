import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Store, User, Truck } from 'lucide-react';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
    // Address fields (required for all roles)
    address: '',
    landmark: '',
    city: 'Ahmedabad',
    pincode: '',
    // Vendor specific
    shopName: '',
    category: '',
    // Delivery specific
    vehicleType: '',
    vehicleNumber: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data based on role
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        address: formData.address,
        landmark: formData.landmark,
        city: formData.city,
        pincode: formData.pincode
      };

      // Add vendor-specific fields
      if (formData.role === 'VENDOR') {
        dataToSend.shopName = formData.shopName;
        dataToSend.category = formData.category;
      }

      // Add delivery-specific fields
      if (formData.role === 'DELIVERY') {
        dataToSend.vehicleType = formData.vehicleType;
        dataToSend.vehicleNumber = formData.vehicleNumber;
      }
      
      await register(dataToSend);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join The Local Loop community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to register as:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.role === 'CUSTOMER'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <User className={`h-8 w-8 mx-auto mb-2 ${
                  formData.role === 'CUSTOMER' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-gray-900">Customer</p>
                <p className="text-xs text-gray-500 mt-1">Shop from local vendors</p>
              </button>

              {/* Vendor */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'VENDOR' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.role === 'VENDOR'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <Store className={`h-8 w-8 mx-auto mb-2 ${
                  formData.role === 'VENDOR' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-gray-900">Vendor</p>
                <p className="text-xs text-gray-500 mt-1">Sell your products</p>
              </button>

              {/* Delivery */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'DELIVERY' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.role === 'DELIVERY'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <Truck className={`h-8 w-8 mx-auto mb-2 ${
                  formData.role === 'DELIVERY' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-gray-900">Delivery Partner</p>
                <p className="text-xs text-gray-500 mt-1">Earn by delivering</p>
              </button>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="input-field"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="input-field"
              placeholder="Minimum 6 characters"
            />
          </div>

          {/* Address Fields (Required for all roles) */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="input-field"
                  placeholder="123 Main Street, Satellite"
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
                    className="input-field"
                    placeholder="Near ISRO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    readOnly
                    className="input-field bg-gray-100"
                    placeholder="Ahmedabad"
                  />
                  <p className="text-xs text-gray-500 mt-1">Currently available only in Ahmedabad</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  className="input-field"
                  placeholder="e.g., 380001, 380015, 380058, 380061"
                />
                <p className="text-xs text-gray-500 mt-1">Valid Ahmedabad pincodes: 380001-380061</p>
              </div>
            </div>
          </div>

          {/* Vendor Specific Fields */}
          {formData.role === 'VENDOR' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    required={formData.role === 'VENDOR'}
                    className="input-field"
                    placeholder="My Local Shop"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grocery">Grocery</option>
                    <option value="dairy">Dairy</option>
                    <option value="bakery">Bakery</option>
                    <option value="meat">Meat & Fish</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Partner Specific Fields */}
          {formData.role === 'DELIVERY' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="GJ01AB1234"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

