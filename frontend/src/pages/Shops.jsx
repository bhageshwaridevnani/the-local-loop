import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Star, Clock, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      // No authentication required for public vendor list
      const response = await axios.get('/api/vendors');
      setShops(response.data.vendors || []);
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || shop.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Local Shops</h1>
          <p className="text-gray-600">Discover amazing products from vendors in your area</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="grocery">Grocery</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food & Beverages</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Shop Grid */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No shops found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Link
                key={shop.id}
                to={`/shops/${shop.id}`}
                className="card hover:scale-105 transition-transform duration-200"
              >
                {/* Shop Image */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 flex items-center justify-center">
                  <Store className="h-20 w-20 text-primary-600" />
                </div>

                {/* Shop Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{shop.shop_name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{shop.address || 'Local Area'}</span>
                    </div>
                  </div>

                  {/* Rating and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold text-gray-900">
                        {shop.rating || '4.5'}
                      </span>
                      <span className="ml-1 text-sm text-gray-500">
                        ({shop.reviews || '50'} reviews)
                      </span>
                    </div>
                    <span className="badge badge-success">
                      <Clock className="h-3 w-3 mr-1" />
                      Open
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div>
                    <span className="badge badge-info">
                      {shop.category || 'General'}
                    </span>
                  </div>

                  {/* View Products Button */}
                  <button className="w-full btn-primary mt-4">
                    View Products
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Shops;

