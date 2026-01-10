-- ============================================
-- THE LOCAL LOOP - AREA-BASED DATABASE SCHEMA
-- ============================================
-- Version: 2.0 (Area Isolation)
-- Purpose: Hyperlocal marketplace with strict area-based filtering
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

-- ============================================
-- 1. AREAS TABLE (Master table for all areas)
-- ============================================
CREATE TABLE areas (
    area_id SERIAL PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincodes TEXT[] NOT NULL, -- Array of pincodes
    landmarks TEXT[], -- Array of landmarks
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Gota, Ahmedabad as first area
INSERT INTO areas (area_name, city, state, pincodes, landmarks) VALUES
('Gota, Ahmedabad', 'Ahmedabad', 'Gujarat', 
 ARRAY['382481', '382470', '382424'],
 ARRAY['Silver Oak University', 'Gota Gam', 'Gota Circle', 'Ognaj', 'Sargasan']);

-- ============================================
-- 2. USERS TABLE (All users with area_id)
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL REFERENCES areas(area_id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'vendor', 'delivery')),
    
    -- Address details
    address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    
    -- Vendor specific
    shop_name VARCHAR(200),
    shop_category VARCHAR(100),
    
    -- Delivery specific
    vehicle_type VARCHAR(50),
    vehicle_number VARCHAR(20),
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure area_id matches for all operations
    CONSTRAINT check_area_consistency CHECK (area_id IS NOT NULL)
);

-- Indexes for fast area-based queries
CREATE INDEX idx_users_area_id ON users(area_id);
CREATE INDEX idx_users_role_area ON users(role, area_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 3. PRODUCTS TABLE (Vendor products - area isolated)
-- ============================================
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES users(user_id),
    area_id INTEGER NOT NULL REFERENCES areas(area_id),
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit VARCHAR(50) DEFAULT 'piece',
    
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure vendor and product are in same area
    CONSTRAINT check_vendor_area_match 
        FOREIGN KEY (vendor_id, area_id) 
        REFERENCES users(user_id, area_id)
);

-- Indexes for fast product queries
CREATE INDEX idx_products_area_id ON products(area_id);
CREATE INDEX idx_products_vendor_area ON products(vendor_id, area_id);
CREATE INDEX idx_products_category_area ON products(category, area_id);

-- ============================================
-- 4. ORDERS TABLE (Area-isolated orders)
-- ============================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    area_id INTEGER NOT NULL REFERENCES areas(area_id),
    
    customer_id INTEGER NOT NULL REFERENCES users(user_id),
    vendor_id INTEGER NOT NULL REFERENCES users(user_id),
    delivery_id INTEGER REFERENCES users(user_id),
    
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')),
    
    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee DECIMAL(10, 2) DEFAULT 10.00,
    platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    
    -- Delivery details
    delivery_address TEXT NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    customer_phone VARCHAR(15),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Ensure all parties are in same area
    CONSTRAINT check_order_area_consistency 
        CHECK (area_id IS NOT NULL)
);

-- Indexes for fast order queries
CREATE INDEX idx_orders_area_id ON orders(area_id);
CREATE INDEX idx_orders_customer_area ON orders(customer_id, area_id);
CREATE INDEX idx_orders_vendor_area ON orders(vendor_id, area_id);
CREATE INDEX idx_orders_delivery_area ON orders(delivery_id, area_id);
CREATE INDEX idx_orders_status_area ON orders(status, area_id);

-- ============================================
-- 5. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- VIEWS FOR EASY QUERYING
-- ============================================

-- View: Active vendors by area
CREATE VIEW active_vendors_by_area AS
SELECT 
    u.user_id,
    u.area_id,
    a.area_name,
    u.name,
    u.shop_name,
    u.shop_category,
    u.phone,
    u.address,
    COUNT(p.product_id) as total_products
FROM users u
JOIN areas a ON u.area_id = a.area_id
LEFT JOIN products p ON u.user_id = p.vendor_id AND p.is_available = true
WHERE u.role = 'vendor' AND u.is_active = true
GROUP BY u.user_id, u.area_id, a.area_name, u.name, u.shop_name, u.shop_category, u.phone, u.address;

-- View: Available products by area
CREATE VIEW available_products_by_area AS
SELECT 
    p.product_id,
    p.area_id,
    a.area_name,
    p.name as product_name,
    p.category,
    p.price,
    p.stock_quantity,
    p.unit,
    u.shop_name as vendor_shop,
    u.name as vendor_name,
    u.user_id as vendor_id
FROM products p
JOIN areas a ON p.area_id = a.area_id
JOIN users u ON p.vendor_id = u.user_id
WHERE p.is_available = true AND p.stock_quantity > 0 AND u.is_active = true;

-- View: Orders by area with details
CREATE VIEW orders_by_area AS
SELECT 
    o.order_id,
    o.area_id,
    a.area_name,
    o.order_number,
    o.status,
    o.total_amount,
    c.name as customer_name,
    v.shop_name as vendor_shop,
    d.name as delivery_person,
    o.created_at,
    o.delivered_at
FROM orders o
JOIN areas a ON o.area_id = a.area_id
JOIN users c ON o.customer_id = c.user_id
JOIN users v ON o.vendor_id = v.user_id
LEFT JOIN users d ON o.delivery_id = d.user_id;

-- ============================================
-- FUNCTIONS FOR AREA VALIDATION
-- ============================================

-- Function to check if user belongs to area
CREATE OR REPLACE FUNCTION check_user_area(p_user_id INTEGER, p_area_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = p_user_id AND area_id = p_area_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's area
CREATE OR REPLACE FUNCTION get_user_area(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_area_id INTEGER;
BEGIN
    SELECT area_id INTO v_area_id FROM users WHERE user_id = p_user_id;
    RETURN v_area_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Sample users (all in Gota, Ahmedabad - area_id = 1)
INSERT INTO users (area_id, name, email, password_hash, phone, role, address, pincode, city, shop_name, shop_category, is_verified) VALUES
-- Customers
(1, 'Raj Patel', 'raj@example.com', '$2b$10$hashedpassword1', '9876543210', 'customer', '352, Silver Oak University', '382481', 'Ahmedabad', NULL, NULL, true),
(1, 'Priya Shah', 'priya@example.com', '$2b$10$hashedpassword2', '9876543211', 'customer', 'Gota Gam, Near Circle', '382481', 'Ahmedabad', NULL, NULL, true),

-- Vendors
(1, 'Ramesh Kumar', 'ramesh@example.com', '$2b$10$hashedpassword3', '9876543212', 'vendor', 'Shop 5, Gota Market', '382481', 'Ahmedabad', 'Fresh Vegetables', 'Grocery', true),
(1, 'Suresh Patel', 'suresh@example.com', '$2b$10$hashedpassword4', '9876543213', 'vendor', 'Shop 12, Gota Circle', '382481', 'Ahmedabad', 'Daily Needs Store', 'Grocery', true),

-- Delivery
(1, 'Vikram Singh', 'vikram@example.com', '$2b$10$hashedpassword5', '9876543214', 'delivery', 'Gota Gam', '382481', 'Ahmedabad', NULL, NULL, true);

-- Sample products (all in area_id = 1)
INSERT INTO products (vendor_id, area_id, name, description, category, price, stock_quantity, unit, is_available) VALUES
(3, 1, 'Fresh Tomatoes', 'Farm fresh tomatoes', 'Vegetables', 40.00, 50, 'kg', true),
(3, 1, 'Onions', 'Premium quality onions', 'Vegetables', 30.00, 100, 'kg', true),
(4, 1, 'Milk', 'Fresh cow milk', 'Dairy', 60.00, 20, 'liter', true),
(4, 1, 'Bread', 'Whole wheat bread', 'Bakery', 35.00, 30, 'piece', true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE areas IS 'Master table for all service areas';
COMMENT ON TABLE users IS 'All users (customers, vendors, delivery) with area isolation';
COMMENT ON TABLE products IS 'Vendor products - strictly area-based';
COMMENT ON TABLE orders IS 'Orders - all parties must be in same area';
COMMENT ON COLUMN users.area_id IS 'Links user to their service area - CRITICAL for isolation';
COMMENT ON COLUMN products.area_id IS 'Ensures products are only visible in their area';
COMMENT ON COLUMN orders.area_id IS 'Ensures orders stay within area boundaries';

-- Made with Bob
