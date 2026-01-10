# 🚀 Phase 2: Backend API Implementation Plan

## 🎯 Core Concept: 5km Radius-Based Hyperlocal Marketplace

### The Vision
```
Customer at Location A (Gota)
    ↓
System calculates distance to all vendors
    ↓
Shows ONLY vendors within 5km radius
    ↓
Vendor at 3km away → ✅ VISIBLE
Vendor at 7km away → ❌ HIDDEN
```

---

## 📊 Database Schema Updates

### Add Geolocation to Users Table
```sql
ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN location_verified BOOLEAN DEFAULT false;

-- Index for fast geospatial queries
CREATE INDEX idx_users_location ON users(latitude, longitude);
```

### Distance Calculation Function
```sql
-- Haversine formula for distance calculation
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Earth radius in km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    
    a := SIN(dLat/2) * SIN(dLat/2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dLon/2) * SIN(dLon/2);
    
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;
```

---

## 🛠️ Backend API Structure

### Technology Stack
- **Framework**: Node.js + Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcrypt
- **Validation**: express-validator
- **CORS**: cors middleware

### Project Structure
```
backend/
├── server.js                 # Main entry point
├── config/
│   ├── database.js          # PostgreSQL connection
│   └── jwt.js               # JWT configuration
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── areaValidation.js   # Distance-based validation
│   └── errorHandler.js      # Error handling
├── routes/
│   ├── auth.js              # Login/Register
│   ├── customer.js          # Customer APIs
│   ├── vendor.js            # Vendor APIs
│   └── delivery.js          # Delivery APIs
├── controllers/
│   ├── authController.js
│   ├── customerController.js
│   ├── vendorController.js
│   └── deliveryController.js
├── utils/
│   ├── distance.js          # Distance calculation
│   ├── geocoding.js         # Address → Lat/Lng
│   └── validation.js        # Input validation
└── package.json
```

---

## 🔐 Authentication Flow

### 1. Registration (Already Done)
```
User fills form
    ↓
AI validates address
    ↓
Geocode address → Get lat/lng
    ↓
Store user with coordinates
    ↓
Return success
```

### 2. Login Flow (To Implement)
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
    ↓
Verify credentials
    ↓
Generate JWT with user data
    ↓
Return:
{
  "token": "jwt_token",
  "user": {
    "id": 123,
    "name": "Raj",
    "role": "customer",
    "latitude": 23.1167,
    "longitude": 72.5667
  }
}
```

---

## 📍 Distance-Based Filtering

### Customer Sees Nearby Vendors
```javascript
GET /api/customer/vendors?radius=5

// Backend logic:
1. Get customer's lat/lng from JWT
2. Query all vendors
3. Calculate distance to each vendor
4. Filter: distance <= 5km
5. Sort by distance (nearest first)
6. Return filtered list
```

### SQL Query Example
```sql
SELECT 
    v.*,
    calculate_distance(
        $1, $2,  -- Customer lat/lng
        v.latitude, v.longitude
    ) as distance_km
FROM users v
WHERE v.role = 'vendor'
  AND v.is_active = true
  AND calculate_distance($1, $2, v.latitude, v.longitude) <= 5
ORDER BY distance_km ASC;
```

---

## 🔄 Complete API Endpoints

### Authentication APIs
```javascript
POST /api/auth/register
- Body: { name, email, password, role, address, pincode, city }
- Returns: { success, message, user }

POST /api/auth/login
- Body: { email, password }
- Returns: { token, user }

GET /api/auth/me
- Headers: { Authorization: "Bearer <token>" }
- Returns: { user }

POST /api/auth/logout
- Clears session
```

### Customer APIs
```javascript
GET /api/customer/vendors?radius=5
- Returns: [ { vendor, distance_km, products_count } ]

GET /api/customer/products?vendor_id=X&radius=5
- Returns: [ { product, vendor, distance_km } ]

POST /api/customer/orders
- Body: { vendor_id, items[], delivery_address }
- Validates: vendor within 5km
- Returns: { order }

GET /api/customer/orders
- Returns: [ { order, vendor, delivery, status } ]
```

### Vendor APIs
```javascript
GET /api/vendor/orders?status=pending
- Returns: Orders from customers within 5km

POST /api/vendor/products
- Body: { name, price, stock, category }
- Returns: { product }

PUT /api/vendor/products/:id
- Updates product

PUT /api/vendor/orders/:id/status
- Updates order status
```

### Delivery APIs
```javascript
GET /api/delivery/available-orders?radius=5
- Returns: Orders within 5km radius

POST /api/delivery/accept-order/:id
- Validates: order within 5km
- Assigns delivery person

PUT /api/delivery/orders/:id/status
- Updates delivery status
```

---

## 🛡️ Distance Validation Middleware

```javascript
// middleware/distanceValidation.js
const validateDistance = (maxDistance = 5) => {
  return async (req, res, next) => {
    const userLat = req.user.latitude;
    const userLng = req.user.longitude;
    
    const targetLat = req.body.latitude || req.query.latitude;
    const targetLng = req.body.longitude || req.query.longitude;
    
    const distance = calculateDistance(
      userLat, userLng,
      targetLat, targetLng
    );
    
    if (distance > maxDistance) {
      return res.status(403).json({
        error: 'Location too far',
        distance: distance,
        maxDistance: maxDistance
      });
    }
    
    req.distance = distance;
    next();
  };
};
```

---

## 🌍 Geocoding Integration

### Convert Address to Coordinates

**Option 1: Google Maps Geocoding API**
```javascript
const geocodeAddress = async (address) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`
  );
  const data = await response.json();
  return {
    latitude: data.results[0].geometry.location.lat,
    longitude: data.results[0].geometry.location.lng
  };
};
```

**Option 2: OpenStreetMap (Free)**
```javascript
const geocodeAddress = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${address}&format=json`
  );
  const data = await response.json();
  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon)
  };
};
```

---

## 📱 Frontend Integration

### Store User Location
```javascript
// After login
localStorage.setItem('user', JSON.stringify({
  id: 123,
  name: 'Raj',
  role: 'customer',
  latitude: 23.1167,
  longitude: 72.5667,
  token: 'jwt_token'
}));
```

### Fetch Nearby Vendors
```javascript
const fetchNearbyVendors = async (radius = 5) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await fetch(
    `/api/customer/vendors?radius=${radius}`,
    {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    }
  );
  
  const vendors = await response.json();
  // vendors sorted by distance
  return vendors;
};
```

---

## 🎯 Example Scenarios

### Scenario 1: Customer Browses Vendors

```
1. Customer (Gota) logs in
   - Lat: 23.1167, Lng: 72.5667

2. Requests nearby vendors (5km)

3. Backend calculates distances:
   - Vendor A (Gota): 2.3km ✅
   - Vendor B (Chandkheda): 4.8km ✅
   - Vendor C (Satellite): 8.2km ❌

4. Returns: [Vendor A, Vendor B]
   Sorted by distance
```

### Scenario 2: Customer Places Order

```
1. Customer selects Vendor A (2.3km away)

2. Adds products to cart

3. Places order

4. Backend validates:
   - Vendor within 5km? ✅
   - Products available? ✅
   - Creates order

5. Order visible to:
   - Customer ✅
   - Vendor A ✅
   - Delivery boys within 5km of vendor ✅
```

### Scenario 3: Delivery Boy Accepts Order

```
1. Delivery boy (Gota) logs in
   - Lat: 23.1200, Lng: 72.5700

2. Requests available orders (5km)

3. Backend shows orders where:
   - Vendor within 5km ✅
   - Customer within 5km ✅

4. Accepts order

5. Picks from vendor → Delivers to customer
   (Both within 5km radius)
```

---

## 🔧 Implementation Steps

### Step 1: Database Setup
```bash
cd backend
npm init -y
npm install express pg bcrypt jsonwebtoken cors dotenv
```

### Step 2: Create Database Schema
```sql
-- Run schema_v2_area_based.sql
-- Add latitude/longitude columns
-- Add distance calculation function
```

### Step 3: Build Authentication
```javascript
// Implement login/register
// JWT token generation
// Password hashing
```

### Step 4: Implement Distance Filtering
```javascript
// Distance calculation utility
// Vendor filtering by radius
// Order filtering by radius
```

### Step 5: Create APIs
```javascript
// Customer APIs
// Vendor APIs
// Delivery APIs
```

### Step 6: Frontend Integration
```javascript
// Login page
// Customer dashboard
// Vendor dashboard
```

---

## 📊 Performance Optimization

### Database Indexes
```sql
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_role_active ON users(role, is_active);
```

### Caching Strategy
```javascript
// Cache vendor locations (update every 5 minutes)
// Cache product listings (update on change)
```

### Query Optimization
```sql
-- Use spatial indexes for faster distance queries
-- Limit results to reasonable number (e.g., 50 vendors max)
```

---

## 🎯 Success Metrics

- ✅ Customer sees only vendors within 5km
- ✅ Vendor gets only orders from customers within 5km
- ✅ Delivery sees only orders within 5km
- ✅ Distance calculated accurately
- ✅ Fast response times (<500ms)

---

**This is a truly hyperlocal marketplace with precise distance-based filtering! 🎯**