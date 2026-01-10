# The Local Loop - Backend API

Backend API for The Local Loop hyperlocal marketplace with distance-based vendor filtering.

## 🚀 Features

- **JWT Authentication** - Secure user authentication with role-based access
- **Distance-Based Filtering** - 5km radius vendor filtering using Haversine formula
- **PostgreSQL Database** - Robust data storage with geospatial queries
- **AI Integration** - Address validation via AI service
- **RESTful API** - Clean, well-documented API endpoints

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- AI Service running on port 8000

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=the_local_loop
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# AI Service URL
AI_SERVICE_URL=http://localhost:8000

# Distance Configuration (in kilometers)
DEFAULT_RADIUS=5
MAX_RADIUS=10

# Platform Configuration
DELIVERY_FEE=10.00
PLATFORM_FEE_PERCENTAGE=5
```

### 3. Setup Database

```bash
# Create database
createdb the_local_loop

# Run schema
psql -d the_local_loop -f ../database/schema_v3_distance_based.sql
```

### 4. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "customer",
  "address": "123 Main St, Gota",
  "pincode": "382481",
  "city": "Ahmedabad"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Customer APIs

#### Get Nearby Vendors
```http
GET /api/customer/vendors?radius=5
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "vendorId": 4,
        "name": "Ramesh Kumar",
        "shopName": "Fresh Vegetables",
        "shopCategory": "Grocery",
        "distance": 2.34,
        "productsCount": 10
      }
    ],
    "count": 1,
    "radius": 5
  }
}
```

#### Get Nearby Products
```http
GET /api/customer/products?radius=5&category=Vegetables
Authorization: Bearer <token>
```

#### Get Vendor Details
```http
GET /api/customer/vendors/:vendorId
Authorization: Bearer <token>
```

#### Place Order
```http
POST /api/customer/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "vendorId": 4,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "deliveryAddress": "123 Main St, Gota",
  "deliveryPincode": "382481",
  "customerPhone": "9876543210"
}
```

#### Get My Orders
```http
GET /api/customer/orders?status=pending
Authorization: Bearer <token>
```

#### Get Order Details
```http
GET /api/customer/orders/:orderId
Authorization: Bearer <token>
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned upon successful login/registration.

## 📍 Distance-Based Filtering

### How It Works

1. **User Location**: Stored as latitude/longitude during registration
2. **Distance Calculation**: Uses Haversine formula for accurate distance
3. **Radius Filtering**: Default 5km, maximum 10km
4. **Sorted Results**: Vendors/products sorted by distance (nearest first)

### Example Flow

```
Customer at Gota (23.1167, 72.5667)
    ↓
Requests vendors within 5km
    ↓
System calculates distance to all vendors
    ↓
Returns only vendors ≤ 5km away
    ↓
Sorted by distance (closest first)
```

## 🗄️ Database Schema

### Key Tables

- **users** - All users (customers, vendors, delivery) with geolocation
- **products** - Vendor products
- **orders** - Orders with distance tracking
- **order_items** - Order line items

### Key Functions

- `calculate_distance(lat1, lon1, lat2, lon2)` - Haversine distance calculation
- `get_nearby_vendors(lat, lon, radius)` - Get vendors within radius
- `get_nearby_products(lat, lon, radius, category)` - Get products within radius

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer",
    "address": "Gota, Ahmedabad",
    "pincode": "382481",
    "city": "Ahmedabad"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # PostgreSQL connection
│   └── jwt.js               # JWT configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── customerController.js # Customer operations
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── distanceValidation.js # Distance validation
│   └── errorHandler.js      # Error handling
├── routes/
│   ├── auth.js              # Auth routes
│   └── customer.js          # Customer routes
├── utils/
│   └── distance.js          # Distance calculations
├── .env                     # Environment variables
├── package.json             # Dependencies
├── server.js                # Main entry point
└── README.md                # This file
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | the_local_loop |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | Token expiry | 7d |
| AI_SERVICE_URL | AI service URL | http://localhost:8000 |
| DEFAULT_RADIUS | Default search radius (km) | 5 |
| MAX_RADIUS | Maximum search radius (km) | 10 |

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep the_local_loop

# Verify credentials in .env
```

### AI Service Not Available
```bash
# Check AI service is running
curl http://localhost:8000/health

# Start AI service
cd ../ai-agents
python main.py
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in .env
PORT=3001
```

## 📝 Development Notes

### Adding New Endpoints

1. Create controller function in `controllers/`
2. Add route in `routes/`
3. Apply appropriate middleware (auth, validation)
4. Test with curl or Postman

### Distance Validation

All customer endpoints automatically validate:
- User has location coordinates
- Radius is within allowed limits
- Vendors/products are within specified radius

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use production database
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring

## 📄 License

MIT

## 👥 Team

The Local Loop Team - Hackathon Project

---

**Made with ❤️ for The Local Loop Hackathon**