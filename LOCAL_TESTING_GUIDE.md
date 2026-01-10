# 🧪 Local Testing Guide - The Local Loop

## 📋 Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v16+) - `node --version`
- ✅ Python 3 - `python3 --version`
- ✅ PostgreSQL - `psql --version`
- ✅ Git - `git --version`

---

## 🚀 Step-by-Step Setup & Testing

### Step 1: Install PostgreSQL (if not installed)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Verify Installation:**
```bash
psql --version
# Should show: psql (PostgreSQL) 14.x or higher
```

---

### Step 2: Setup Database

```bash
# Create database
createdb the_local_loop

# If you get permission error, create with postgres user:
sudo -u postgres createdb the_local_loop

# Run the schema
cd /Users/bhageshwaridevnani/Documents/the-local-loop
psql -d the_local_loop -f database/schema_v3_distance_based.sql

# Verify tables were created
psql -d the_local_loop -c "\dt"
```

**Expected Output:**
```
             List of relations
 Schema |     Name      | Type  |  Owner   
--------+---------------+-------+----------
 public | areas         | table | your_user
 public | order_items   | table | your_user
 public | orders        | table | your_user
 public | products      | table | your_user
 public | users         | table | your_user
```

---

### Step 3: Configure Backend

```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/backend

# Update .env file with your database password
# Open .env and set:
# DB_PASSWORD=your_postgres_password

# Install dependencies
npm install
```

---

### Step 4: Start All Services

Open **3 separate terminal windows**:

#### Terminal 1: AI Service (Port 8000)
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/ai-agents
python3 main.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 2: Backend API (Port 3000)
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/backend
npm run dev
```

**Expected Output:**
```
============================================================
🚀 THE LOCAL LOOP - BACKEND API
============================================================
✅ Server running on port 3000
✅ Environment: development
✅ Database: Connected
✅ AI Service: http://localhost:8000

📍 Available Endpoints:
   - Health Check: http://localhost:3000/health
   - Auth API: http://localhost:3000/api/auth
   - Customer API: http://localhost:3000/api/customer
   - Vendor API: http://localhost:3000/api/vendor
   - Delivery API: http://localhost:3000/api/delivery
============================================================
```

#### Terminal 3: Frontend (Port 5173)
```bash
cd /Users/bhageshwaridevnani/Documents/the-local-loop/frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 Testing the APIs

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "The Local Loop Backend API is running",
  "timestamp": "2026-01-10T17:00:00.000Z",
  "environment": "development"
}
```

---

### Test 2: Register a Customer

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@test.com",
    "password": "password123",
    "role": "customer",
    "address": "Silver Oak University, Gota, Ahmedabad",
    "pincode": "382481",
    "city": "Ahmedabad"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 6,
      "name": "Test Customer",
      "email": "customer@test.com",
      "role": "customer",
      "latitude": 23.1167,
      "longitude": 72.5667
    }
  }
}
```

**Save the token!** You'll need it for authenticated requests.

---

### Test 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 6,
      "name": "Test Customer",
      "role": "customer",
      "latitude": 23.1167,
      "longitude": 72.5667
    }
  }
}
```

---

### Test 4: Get Nearby Vendors (Customer)

**Replace YOUR_TOKEN with the token from login:**

```bash
curl http://localhost:3000/api/customer/vendors?radius=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
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
        "distance": 0.15,
        "productsCount": 3
      },
      {
        "vendorId": 5,
        "name": "Suresh Patel",
        "shopName": "Daily Needs Store",
        "shopCategory": "Grocery",
        "distance": 0.23,
        "productsCount": 3
      }
    ],
    "count": 2,
    "radius": 5
  }
}
```

---

### Test 5: Get Nearby Products

```bash
curl http://localhost:3000/api/customer/products?radius=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": 1,
        "name": "Fresh Tomatoes",
        "category": "Vegetables",
        "price": 40.00,
        "stock": 50,
        "vendor": {
          "vendorId": 4,
          "name": "Ramesh Kumar",
          "shopName": "Fresh Vegetables"
        },
        "distance": 0.15
      }
    ],
    "count": 10
  }
}
```

---

### Test 6: Place an Order

```bash
curl -X POST http://localhost:3000/api/customer/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": 4,
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 2, "quantity": 1}
    ],
    "deliveryAddress": "Silver Oak University, Gota",
    "deliveryPincode": "382481",
    "customerPhone": "9876543210"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": 1,
    "orderNumber": "ORD-1736524800000-6",
    "status": "pending",
    "totalAmount": 120.00,
    "distance": "0.15",
    "vendor": {
      "name": "Ramesh Kumar",
      "shopName": "Fresh Vegetables"
    }
  }
}
```

---

### Test 7: Login as Vendor

**Use sample vendor credentials:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ramesh@example.com",
    "password": "password123"
  }'
```

**Save the vendor token!**

---

### Test 8: Get Vendor Dashboard

```bash
curl http://localhost:3000/api/vendor/dashboard \
  -H "Authorization: Bearer VENDOR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "products": {
      "total": 3,
      "available": 3
    },
    "orders": {
      "total": 1,
      "pending": 1,
      "completed": 0
    },
    "revenue": {
      "total": 0,
      "today": 0
    }
  }
}
```

---

### Test 9: Get Vendor Orders

```bash
curl http://localhost:3000/api/vendor/orders \
  -H "Authorization: Bearer VENDOR_TOKEN"
```

---

### Test 10: Update Order Status (Vendor)

```bash
curl -X PUT http://localhost:3000/api/vendor/orders/1/status \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

### Test 11: Login as Delivery Partner

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vikram@example.com",
    "password": "password123"
  }'
```

**Save the delivery token!**

---

### Test 12: Get Available Orders (Delivery)

```bash
curl http://localhost:3000/api/delivery/available-orders?radius=5 \
  -H "Authorization: Bearer DELIVERY_TOKEN"
```

---

### Test 13: Accept Order (Delivery)

```bash
curl -X POST http://localhost:3000/api/delivery/orders/1/accept \
  -H "Authorization: Bearer DELIVERY_TOKEN"
```

---

### Test 14: Update Delivery Status

```bash
curl -X PUT http://localhost:3000/api/delivery/orders/1/status \
  -H "Authorization: Bearer DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "picked_up"}'
```

---

## 🌐 Testing in Browser

### 1. Open Frontend
```
http://localhost:5173
```

### 2. Test Registration
- Fill the registration form
- Select role: Customer
- Enter Gota, Ahmedabad address
- Submit

### 3. Check AI Validation
- Watch Terminal 1 (AI Service) for validation logs
- Should see: "POST /agents/area-validation HTTP/1.1" 200 OK

### 4. Check Backend
- Watch Terminal 2 (Backend) for API calls
- Should see: "POST /api/auth/register"

---

## 🐛 Troubleshooting

### Issue 1: Database Connection Failed

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it:
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux

# Check connection
psql -d the_local_loop -c "SELECT 1"
```

---

### Issue 2: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in backend/.env
PORT=3001
```

---

### Issue 3: AI Service Not Running

**Error:** `Failed to connect to AI service`

**Solution:**
```bash
# Check if AI service is running
curl http://localhost:8000/health

# If not, start it:
cd ai-agents
python3 main.py
```

---

### Issue 4: Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 5: Database Schema Not Loaded

**Error:** `relation "users" does not exist`

**Solution:**
```bash
# Drop and recreate database
dropdb the_local_loop
createdb the_local_loop

# Load schema
psql -d the_local_loop -f database/schema_v3_distance_based.sql

# Verify
psql -d the_local_loop -c "\dt"
```

---

## 📊 Sample Test Data

The database comes with pre-loaded sample data:

### Sample Customers
- **Email:** raj@example.com | **Password:** password123
- **Email:** priya@example.com | **Password:** password123

### Sample Vendors
- **Email:** ramesh@example.com | **Password:** password123
- **Email:** suresh@example.com | **Password:** password123

### Sample Delivery
- **Email:** vikram@example.com | **Password:** password123

**Note:** All sample passwords are hashed. Use "password123" to login.

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created and schema loaded
- [ ] AI Service running on port 8000
- [ ] Backend API running on port 3000
- [ ] Frontend running on port 5173
- [ ] Health check returns success
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can get nearby vendors
- [ ] Can place order
- [ ] Vendor can see orders
- [ ] Delivery can accept orders

---

## 🎯 Quick Test Script

Save this as `test-all.sh`:

```bash
#!/bin/bash

echo "🧪 Testing The Local Loop APIs..."
echo ""

# Health Check
echo "1️⃣ Health Check..."
curl -s http://localhost:3000/health | jq .
echo ""

# Register
echo "2️⃣ Registering customer..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@test.com",
    "password": "password123",
    "role": "customer",
    "address": "Gota, Ahmedabad",
    "pincode": "382481",
    "city": "Ahmedabad"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
echo "Token: ${TOKEN:0:50}..."
echo ""

# Get Vendors
echo "3️⃣ Getting nearby vendors..."
curl -s http://localhost:3000/api/customer/vendors?radius=5 \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "✅ All tests completed!"
```

**Run it:**
```bash
chmod +x test-all.sh
./test-all.sh
```

---

## 📞 Need Help?

1. Check all 3 terminals are running
2. Verify database connection: `psql -d the_local_loop -c "SELECT COUNT(*) FROM users"`
3. Check logs in each terminal for errors
4. Ensure ports 3000, 5173, 8000 are free

---

**Happy Testing! 🚀**