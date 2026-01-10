# 🎯 The Local Loop - Area-Based Architecture

## 📋 Table of Contents
1. [Core Concept](#core-concept)
2. [Area Isolation Strategy](#area-isolation-strategy)
3. [Database Design](#database-design)
4. [User Flow](#user-flow)
5. [Implementation Plan](#implementation-plan)

---

## 🎯 Core Concept

### The Vision
**Hyperlocal marketplace where everything is area-isolated**

```
┌─────────────────────────────────────────────────┐
│           GOTA, AHMEDABAD (Area 1)              │
├─────────────────────────────────────────────────┤
│                                                 │
│  👤 Customer (Gota)                             │
│      ↓                                          │
│      Sees ONLY Gota Vendors                     │
│      ↓                                          │
│  🏪 Vendor (Gota)                               │
│      ↓                                          │
│      Gets ONLY Gota Orders                      │
│      ↓                                          │
│  🚴 Delivery (Gota)                             │
│      ↓                                          │
│      Delivers ONLY Gota Orders                  │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         ANDHERI WEST, MUMBAI (Area 2)           │
├─────────────────────────────────────────────────┤
│  Completely separate ecosystem                  │
│  No cross-area visibility or interaction        │
└─────────────────────────────────────────────────┘
```

---

## 🔒 Area Isolation Strategy

### 1. Database Level Isolation

**Every table has `area_id`:**
```sql
users.area_id       → User belongs to this area
products.area_id    → Product available in this area
orders.area_id      → Order happens in this area
```

**Foreign Key Constraints:**
```sql
-- Ensures vendor and product are in same area
CONSTRAINT check_vendor_area_match 
    FOREIGN KEY (vendor_id, area_id) 
    REFERENCES users(user_id, area_id)
```

### 2. Application Level Isolation

**Every API call includes area_id:**
```javascript
// Customer sees only Gota vendors
GET /api/vendors?area_id=1

// Vendor sees only Gota orders
GET /api/orders?vendor_id=123&area_id=1

// Delivery sees only Gota deliveries
GET /api/deliveries?delivery_id=456&area_id=1
```

### 3. Frontend Level Isolation

**User's area_id stored in session:**
```javascript
// After login
localStorage.setItem('user', JSON.stringify({
    user_id: 123,
    area_id: 1,  // ← CRITICAL
    role: 'customer'
}));

// Every API call uses this area_id
const response = await fetch(`/api/products?area_id=${user.area_id}`);
```

---

## 🗄️ Database Design

### Key Tables

#### 1. Areas (Master Table)
```sql
areas
├── area_id (PK)
├── area_name (e.g., "Gota, Ahmedabad")
├── city
├── pincodes[] (Array: ["382481", "382470"])
└── landmarks[] (Array: ["Silver Oak University"])
```

#### 2. Users (All Roles)
```sql
users
├── user_id (PK)
├── area_id (FK → areas) ← CRITICAL
├── role (customer/vendor/delivery)
├── email, password_hash
├── address, pincode, city
├── shop_name (if vendor)
└── vehicle_type (if delivery)
```

#### 3. Products (Vendor Items)
```sql
products
├── product_id (PK)
├── vendor_id (FK → users)
├── area_id (FK → areas) ← CRITICAL
├── name, price, stock
└── CONSTRAINT: vendor.area_id = product.area_id
```

#### 4. Orders
```sql
orders
├── order_id (PK)
├── area_id (FK → areas) ← CRITICAL
├── customer_id (FK → users)
├── vendor_id (FK → users)
├── delivery_id (FK → users)
└── CONSTRAINT: All must be in same area
```

---

## 👤 User Flow

### Registration Flow

```
1. User enters address
   ↓
2. AI validates area (Vertex AI)
   ↓
3. If approved → area_id assigned
   ↓
4. User registered with area_id
   ↓
5. Can ONLY interact within this area
```

### Login Flow

```
1. User logs in
   ↓
2. Backend returns: user_id, area_id, role
   ↓
3. Frontend stores area_id in session
   ↓
4. All subsequent requests include area_id
   ↓
5. Backend validates area_id matches user's area
```

### Customer Flow

```
Login
  ↓
Dashboard (area_id=1)
  ↓
Browse Vendors (WHERE area_id=1)
  ↓
View Products (WHERE area_id=1)
  ↓
Place Order (area_id=1)
  ↓
Track Order (area_id=1)
```

### Vendor Flow

```
Login
  ↓
Dashboard (area_id=1)
  ↓
Add Products (area_id=1)
  ↓
View Orders (WHERE vendor_id=X AND area_id=1)
  ↓
Update Order Status
  ↓
View Earnings (area_id=1)
```

### Delivery Flow

```
Login
  ↓
Dashboard (area_id=1)
  ↓
View Available Orders (WHERE area_id=1 AND status='ready')
  ↓
Accept Order
  ↓
Pick up from Vendor (area_id=1)
  ↓
Deliver to Customer (area_id=1)
  ↓
Mark Delivered
```

---

## 🛠️ Implementation Plan

### Phase 1: Backend API (Node.js + Express)

#### 1.1 Authentication API
```javascript
POST /api/auth/register
- Validates area using AI
- Assigns area_id
- Creates user

POST /api/auth/login
- Returns JWT with area_id
- Frontend stores area_id

GET /api/auth/me
- Returns user with area_id
```

#### 1.2 Customer API
```javascript
GET /api/customers/vendors?area_id=1
- Returns vendors in area

GET /api/customers/products?area_id=1&vendor_id=X
- Returns products in area

POST /api/customers/orders
- Creates order (validates area_id)

GET /api/customers/orders?area_id=1
- Returns customer's orders
```

#### 1.3 Vendor API
```javascript
POST /api/vendors/products
- Creates product (with area_id)

GET /api/vendors/orders?area_id=1
- Returns vendor's orders

PUT /api/vendors/orders/:id/status
- Updates order status
```

#### 1.4 Delivery API
```javascript
GET /api/delivery/available-orders?area_id=1
- Returns orders ready for pickup

POST /api/delivery/accept-order/:id
- Assigns delivery person

PUT /api/delivery/orders/:id/status
- Updates delivery status
```

### Phase 2: Frontend (React)

#### 2.1 Login Page
```jsx
<Login />
  ↓
Calls /api/auth/login
  ↓
Stores: user_id, area_id, role
  ↓
Redirects based on role
```

#### 2.2 Customer Dashboard
```jsx
<CustomerDashboard area_id={user.area_id} />
  ├── <VendorList area_id={area_id} />
  ├── <ProductList area_id={area_id} />
  └── <OrderHistory area_id={area_id} />
```

#### 2.3 Vendor Dashboard
```jsx
<VendorDashboard area_id={user.area_id} />
  ├── <ProductManagement area_id={area_id} />
  ├── <OrderList area_id={area_id} />
  └── <Earnings area_id={area_id} />
```

#### 2.4 Delivery Dashboard
```jsx
<DeliveryDashboard area_id={user.area_id} />
  ├── <AvailableOrders area_id={area_id} />
  ├── <ActiveDeliveries area_id={area_id} />
  └── <DeliveryHistory area_id={area_id} />
```

### Phase 3: Area Validation Middleware

```javascript
// middleware/areaValidation.js
const validateArea = async (req, res, next) => {
    const userAreaId = req.user.area_id; // From JWT
    const requestAreaId = req.query.area_id || req.body.area_id;
    
    if (userAreaId !== requestAreaId) {
        return res.status(403).json({
            error: 'Area mismatch - Access denied'
        });
    }
    
    next();
};
```

---

## 🔐 Security Rules

### Rule 1: Area Validation
**Every API call must validate area_id**
```javascript
if (user.area_id !== request.area_id) {
    throw new Error('Area mismatch');
}
```

### Rule 2: Database Queries
**Always include area_id in WHERE clause**
```sql
SELECT * FROM products 
WHERE area_id = $1 AND is_available = true;
```

### Rule 3: Order Creation
**Validate all parties are in same area**
```javascript
if (customer.area_id !== vendor.area_id) {
    throw new Error('Cross-area orders not allowed');
}
```

---

## 📊 Example Scenarios

### Scenario 1: Customer Orders from Vendor

```
1. Customer (area_id=1) logs in
2. Sees vendors (WHERE area_id=1)
3. Selects "Fresh Vegetables" shop
4. Sees products (WHERE vendor_id=X AND area_id=1)
5. Adds tomatoes to cart
6. Places order
   - Validates: customer.area_id = vendor.area_id = 1
   - Creates order with area_id=1
7. Order visible to:
   - Customer (area_id=1) ✅
   - Vendor (area_id=1) ✅
   - Delivery boys (area_id=1) ✅
   - Users in area_id=2 ❌
```

### Scenario 2: Delivery Boy Picks Order

```
1. Delivery boy (area_id=1) logs in
2. Sees available orders (WHERE area_id=1 AND status='ready')
3. Accepts order #123
4. Picks up from vendor (area_id=1)
5. Delivers to customer (area_id=1)
6. Marks delivered
7. Earns ₹10 delivery fee
```

---

## 🚀 Benefits of This Architecture

### 1. **True Hyperlocal**
- No cross-area pollution
- Fast, relevant results
- Community-focused

### 2. **Scalable**
- Add new areas easily
- Each area is independent
- No performance impact

### 3. **Simple**
- One rule: Check area_id
- Easy to understand
- Easy to maintain

### 4. **Secure**
- Database-level constraints
- API-level validation
- Frontend-level filtering

---

## 📝 Next Steps

1. ✅ Database schema created
2. ⏳ Implement backend API
3. ⏳ Create login system
4. ⏳ Build dashboards
5. ⏳ Test area isolation
6. ⏳ Deploy and demo

---

**This architecture ensures your vision of area-based isolation is maintained at every level! 🎯**