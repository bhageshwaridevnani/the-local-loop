import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, MapPin, Star, Phone, Clock, ShoppingCart, Plus, Minus, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');

  useEffect(() => {
    fetchShopDetails();
    fetchProducts();
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      // No authentication required for public vendor details
      const response = await axios.get(`/api/vendors/${id}`);
      setShop(response.data.vendor);
    } catch (error) {
      console.error('Failed to fetch shop details:', error);
      toast.error('Failed to load shop details');
    }
  };

  const fetchProducts = async () => {
    try {
      // No authentication required for public product list
      const response = await axios.get(`/api/products?vendorId=${id}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Product out of stock');
      return;
    }
    addToCart(product, 1);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  if (!shop) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Shop not found</h2>
          <button onClick={() => navigate('/shops')} className="btn-primary mt-4">
            Back to Shops
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Shop Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Shop Image */}
            <div className="w-full md:w-48 h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="h-24 w-24 text-primary-600" />
            </div>

            {/* Shop Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.shop_name}</h1>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{shop.address || 'Local Area'}</span>
                </div>
                
                {shop.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{shop.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold text-gray-900">{shop.rating || '4.5'}</span>
                  <span className="text-gray-500 ml-1">({shop.reviews || '50'} reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge badge-success">
                  <Clock className="h-3 w-3 mr-1" />
                  Open Now
                </span>
                <span className="badge badge-info">{shop.category || 'General'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h2>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {brands.length > 0 && (
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const inCart = getItemQuantity(product.id);
                return (
                  <div key={product.id} className="card">
                    {/* Product Image */}
                    <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-gray-400" />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                        {product.brand && (
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        )}
                      </div>

                      {/* Price and Stock */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary-600">
                          ₹{product.price}
                        </span>
                        {product.stock > 0 ? (
                          <span className="badge badge-success">In Stock</span>
                        ) : (
                          <span className="badge badge-danger">Out of Stock</span>
                        )}
                      </div>

                      {product.category && (
                        <span className="badge badge-info text-xs">{product.category}</span>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          product.stock > 0
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {inCart > 0 ? `In Cart (${inCart})` : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopDetails;

