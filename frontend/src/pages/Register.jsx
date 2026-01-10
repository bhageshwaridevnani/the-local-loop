import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    landmark: '',
    city: '',
    pincode: '',
    state: 'Maharashtra',
    areaValidation: null,
    shopName: '',
    shopType: '',
    vehicleType: '',
    password: '',
    confirmPassword: '',
  });

  const totalSteps = 6;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone) {
          alert('Please fill all fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          alert('Please enter a valid email');
          return false;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
          alert('Please enter a valid 10-digit phone number');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.role) {
          alert('Please select your role');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.address || !formData.city || !formData.pincode) {
          alert('Please fill all address fields');
          return false;
        }
        if (!/^\d{6}$/.test(formData.pincode)) {
          alert('Please enter a valid 6-digit pincode');
          return false;
        }
        return true;
      
      case 4:
        return formData.areaValidation?.status === 'approved';
      
      case 5:
        if (formData.role === 'vendor' && !formData.shopName) {
          alert('Please enter your shop name');
          return false;
        }
        if (formData.role === 'delivery' && !formData.vehicleType) {
          alert('Please select your vehicle type');
          return false;
        }
        return true;
      
      case 6:
        if (!formData.password || !formData.confirmPassword) {
          alert('Please fill all password fields');
          return false;
        }
        if (formData.password.length < 8) {
          alert('Password must be at least 8 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const validateArea = async () => {
    setIsValidating(true);
    
    try {
      const response = await fetch('http://localhost:8000/agents/area-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          pincode: formData.pincode,
          city: formData.city,
          coordinates: null
        }),
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setFormData({
          ...formData,
          areaValidation: result.data
        });
        
        if (result.data.status === 'approved') {
          alert('✅ Great! You\'re in our service area!');
          setTimeout(() => setCurrentStep(5), 1500);
        } else if (result.data.status === 'rejected') {
          alert('❌ Sorry, we\'re not in your area yet');
        } else {
          alert('⚠️ We need to verify your location');
        }
      }
    } catch (error) {
      console.error('Area validation error:', error);
      alert('Unable to validate area. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (currentStep === 3) {
        await validateArea();
      } else if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep()) {
      alert('🎉 Registration successful! (Backend not connected yet)');
      console.log('Form data:', formData);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #e6f7f9 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        {/* Header */}
        <div className="text-center mb-4 fade-in">
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--brand-primary)', marginBottom: '8px' }}>
            🏪 The Local Loop
          </h1>
          <p style={{ color: 'var(--gray-600)' }}>Join our hyperlocal community</p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  background: step <= currentStep ? 'var(--brand-primary)' : 'var(--white)',
                  color: step <= currentStep ? 'var(--white)' : 'var(--gray-400)',
                  border: step <= currentStep ? 'none' : '2px solid var(--gray-200)',
                  boxShadow: step <= currentStep ? 'var(--shadow)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
          <p className="text-center" style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '8px' }}>
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Form Card */}
        <div className="card slide-up">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                  Basic Information
                </h2>
                
                <div className="form-group">
                  <label className="form-label">👤 Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">📧 Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">📱 Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                  Choose Your Role
                </h2>
                
                <div className="grid grid-3">
                  <div
                    className={`role-card ${formData.role === 'customer' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('customer')}
                  >
                    <div className="role-icon">🛒</div>
                    <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>Customer</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                      Order from local shops
                    </p>
                  </div>

                  <div
                    className={`role-card ${formData.role === 'vendor' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('vendor')}
                  >
                    <div className="role-icon">🏪</div>
                    <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>Vendor</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                      Sell your products
                    </p>
                  </div>

                  <div
                    className={`role-card ${formData.role === 'delivery' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('delivery')}
                  >
                    <div className="role-icon">🚴</div>
                    <h3 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>Delivery</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                      Deliver orders
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                  📍 Your Address
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="House/Flat No., Street Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Near..."
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="400001"
                      maxLength="6"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: AI Area Validation */}
            {currentStep === 4 && (
              <div className="text-center">
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                  🤖 AI Area Validation
                </h2>
                
                {isValidating ? (
                  <div style={{ padding: '48px 0' }}>
                    <div className="spinner"></div>
                    <p style={{ fontSize: '18px', fontWeight: '500', marginTop: '16px' }}>
                      Validating your area...
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '8px' }}>
                      Our AI is checking if you're in our service area
                    </p>
                  </div>
                ) : formData.areaValidation ? (
                  <div style={{ padding: '32px 0' }}>
                    {formData.areaValidation.status === 'approved' ? (
                      <div className="message message-success">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                          You're in Area 1!
                        </h3>
                        <p style={{ marginBottom: '16px' }}>
                          {formData.areaValidation.message}
                        </p>
                        <div style={{ fontSize: '14px' }}>
                          <p>Confidence: {(formData.areaValidation.confidence * 100).toFixed(0)}%</p>
                          <p>Area: {formData.areaValidation.area_name}</p>
                        </div>
                      </div>
                    ) : formData.areaValidation.status === 'rejected' ? (
                      <div className="message message-error">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Not in Service Area
                        </h3>
                        <p style={{ marginBottom: '16px' }}>
                          {formData.areaValidation.message}
                        </p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="btn btn-primary"
                        >
                          Try Different Address
                        </button>
                      </div>
                    ) : (
                      <div className="message message-warning">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Manual Review Required
                        </h3>
                        <p>{formData.areaValidation.message}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 5: Role-Specific Details */}
            {currentStep === 5 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                  Additional Details
                </h2>
                
                {formData.role === 'vendor' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Shop Name</label>
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Your shop name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Shop Type</label>
                      <select
                        name="shopType"
                        value={formData.shopType}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select shop type</option>
                        <option value="grocery">Grocery Store</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="bakery">Bakery</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.role === 'delivery' && (
                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
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
                    </select>
                  </div>
                )}

                {formData.role === 'customer' && (
                  <div className="text-center" style={{ padding: '32px 0' }}>
                    <p style={{ color: 'var(--gray-600)' }}>
                      You're all set! Just create a password to complete registration.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Password */}
            {currentStep === 6 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                  🔒 Create Password
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Re-enter password"
                  />
                </div>

                <div style={{
                  background: 'var(--brand-bg)',
                  border: '1px solid var(--brand-light)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '14px'
                }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>Password must contain:</p>
                  <ul style={{ marginLeft: '20px' }}>
                    <li style={{ color: formData.password.length >= 8 ? '#10b981' : 'inherit' }}>
                      ✓ At least 8 characters
                    </li>
                    <li style={{ color: /[A-Z]/.test(formData.password) ? '#10b981' : 'inherit' }}>
                      ✓ One uppercase letter
                    </li>
                    <li style={{ color: /[0-9]/.test(formData.password) ? '#10b981' : 'inherit' }}>
                      ✓ One number
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid var(--gray-200)'
            }}>
              {currentStep > 1 && currentStep !== 4 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn btn-secondary"
                >
                  ← Previous
                </button>
              )}

              {currentStep < totalSteps && currentStep !== 4 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                >
                  Next →
                </button>
              )}

              {currentStep === totalSteps && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                >
                  Complete Registration 🎉
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center" style={{ marginTop: '24px', color: 'var(--gray-600)' }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{
              color: 'var(--brand-primary)',
              fontWeight: '600',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;

