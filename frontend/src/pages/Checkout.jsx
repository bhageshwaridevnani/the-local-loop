import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Wallet, ArrowLeft, CheckCircle, Truck, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Delivery partner availability states
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(null);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const deliveryFee = 10;
  const totalAmount = cartTotal + deliveryFee;

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cart, navigate, orderPlaced]);

  // Check delivery partner availability when component mounts
  useEffect(() => {
    checkDeliveryAvailability();
    
    // Recheck every 10 seconds
    const interval = setInterval(() => {
      checkDeliveryAvailability();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const checkDeliveryAvailability = async () => {
    setCheckingAvailability(true);
    try {
      // Group items by vendor to check availability for each vendor
      const vendorGroups = cart.reduce((groups, item) => {
        const vendorId = item.vendorId;
        if (!groups[vendorId]) {
          groups[vendorId] = [];
        }
        groups[vendorId].push(item);
        return groups;
      }, {});

      const vendorIds = Object.keys(vendorGroups);
      
      if (vendorIds.length === 0) {
        setDeliveryAvailable(false);
        setAvailabilityMessage('No items in cart');
        return;
      }

      // Check availability for each vendor
      const availabilityChecks = await Promise.all(
        vendorIds.map(vendorId =>
          axios.get(`/api/delivery/check-availability?vendorId=${vendorId}`)
        )
      );

      // All vendors must have delivery partners available
      const allAvailable = availabilityChecks.every(response => response.data.available);
      
      if (allAvailable) {
        // Combine all available partners (remove duplicates by ID)
        const allPartners = availabilityChecks.flatMap(response => response.data.partners || []);
        const uniquePartners = Array.from(
          new Map(allPartners.map(p => [p.id, p])).values()
        );
        
        setDeliveryAvailable(true);
        setAvailablePartners(uniquePartners);
        setAvailabilityMessage(
          `${uniquePartners.length} delivery partner${uniquePartners.length > 1 ? 's' : ''} available for all your vendors`
        );
      } else {
        // Find which vendors don't have delivery partners
        const unavailableVendors = availabilityChecks
          .filter(response => !response.data.available)
          .map((response, index) => vendorIds[index]);
        
        setDeliveryAvailable(false);
        setAvailablePartners([]);
        setAvailabilityMessage(
          unavailableVendors.length === vendorIds.length
            ? 'No delivery partners available for any of your vendors'
            : `No delivery partners available for ${unavailableVendors.length} vendor(s) in your cart`
        );
      }
    } catch (error) {
      console.error('Availability check error:', error);
      setDeliveryAvailable(false);
      setAvailabilityMessage('Unable to check delivery partner availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    if (!deliveryAvailable) {
      toast.error('No delivery partner available. Please wait and try again.');
      return;
    }

    setLoading(true);
    try {
      // Group items by vendor
      const vendorGroups = cart.reduce((groups, item) => {
        const vendorId = item.vendorId;
        if (!groups[vendorId]) {
          groups[vendorId] = [];
        }
        groups[vendorId].push(item);
        return groups;
      }, {});

      // Create order for each vendor
      const orderPromises = Object.entries(vendorGroups).map(([vendorId, items]) => {
        const orderData = {
          vendorId,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod
        };

        const token = localStorage.getItem('token');
        return axios.post('/api/orders', orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });

      const responses = await Promise.all(orderPromises);
      
      // Get the first order ID for display
      if (responses.length > 0) {
        setOrderId(responses[0].data.order.id);
      }

      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed successfully! A delivery partner has been assigned.');
      
      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      console.error('Place order error:', error);
      
      // Check if it's a "no delivery partner" error
      if (error.response?.data?.error === 'NO_DELIVERY_PARTNER') {
        toast.error(
          error.response.data.message ||
          'No delivery partner is currently available. Please try again later.',
          { duration: 5000 }
        );
        // Recheck availability
        checkDeliveryAvailability();
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to place order';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Your order has been confirmed and will be delivered soon.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                Order ID: <span className="font-mono font-semibold">{orderId?.slice(0, 8)}</span>
              </p>
              <p className="text-sm text-green-800 mt-2">
                Payment Method: {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="btn-primary"
            >
              View My Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Partner Availability Status */}
            <div className={`card border-2 ${
              deliveryAvailable === null 
                ? 'border-gray-300 bg-gray-50' 
                : deliveryAvailable 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
            }`}>
              <div className="flex items-start gap-4">
                {checkingAvailability ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin flex-shrink-0 mt-1" />
                ) : deliveryAvailable ? (
                  <Truck className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-2 ${
                    deliveryAvailable === null 
                      ? 'text-gray-900' 
                      : deliveryAvailable 
                        ? 'text-green-900' 
                        : 'text-red-900'
                  }`}>
                    {checkingAvailability 
                      ? 'Searching for delivery partners...' 
                      : deliveryAvailable 
                        ? '✓ Delivery Partner Available' 
                        : '✗ No Delivery Partner Available'}
                  </h3>
                  
                  <p className={`text-sm mb-3 ${
                    deliveryAvailable === null 
                      ? 'text-gray-600' 
                      : deliveryAvailable 
                        ? 'text-green-700' 
                        : 'text-red-700'
                  }`}>
                    {availabilityMessage}
                  </p>

                  {deliveryAvailable && availablePartners.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-semibold text-green-800 mb-2">
                        Available Delivery Partners:
                      </p>
                      <div className="space-y-2">
                        {availablePartners.slice(0, 3).map((partner, index) => (
                          <div key={partner.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">{partner.name}</span>
                            {partner.vehicleType && (
                              <span className="text-gray-500 text-xs">
                                ({partner.vehicleType})
                              </span>
                            )}
                            {partner.rating && (
                              <span className="text-yellow-600 text-xs">
                                ⭐ {partner.rating}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!deliveryAvailable && !checkingAvailability && (
                    <button
                      onClick={checkDeliveryAvailability}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      🔄 Check Again
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
              </div>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Please provide complete address including house number, street, landmark, and pincode
              </p>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Pay with cash when your order is delivered
                    </p>
                  </div>
                  {paymentMethod === 'COD' && (
                    <CheckCircle className="h-6 w-6 text-primary-600" />
                  )}
                </label>

                {/* Online Payment (Disabled for now) */}
                <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    disabled
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Online Payment</span>
                      <span className="badge badge-warning text-xs">Coming Soon</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Pay online using UPI, Cards, or Net Banking
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !deliveryAvailable || checkingAvailability || !deliveryAddress.trim()}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  loading || !deliveryAvailable || checkingAvailability || !deliveryAddress.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Placing Order...
                  </span>
                ) : checkingAvailability ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Checking Availability...
                  </span>
                ) : !deliveryAvailable ? (
                  'No Delivery Partner Available'
                ) : !deliveryAddress.trim() ? (
                  'Enter Delivery Address'
                ) : (
                  'Place Order'
                )}
              </button>

              {!deliveryAvailable && !checkingAvailability && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  We're automatically checking for available delivery partners every 10 seconds
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;

