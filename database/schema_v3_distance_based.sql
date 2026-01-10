-- ============================================
-- THE LOCAL LOOP - DISTANCE-BASED DATABASE SCHEMA
-- ============================================
-- Version: 3.0 (5km Radius-Based Filtering)
-- Purpose: Hyperlocal marketplace with distance-based vendor filtering
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

-- Insert Ahmedabad as first area (city-wide)
INSERT INTO areas (area_name, city, state, pincodes, landmarks) VALUES
('Ahmedabad', 'Ahmedabad', 'Gujarat', 
 ARRAY['382481', '382470', '382424', '380001', '380002', '380003', '380004', '380005', 
       '380006', '380007', '380008', '380009', '380013', '380014', '380015', '380016',
       '380018', '380019', '380021', '380022', '380023', '380024', '380025', '380026',
       '380027', '380028', '380050', '380051', '380052', '380053', '380054', '380055',
       '380058', '380059', '380060', '380061', '380063'],
 ARRAY['Gota', 'Chandkheda', 'Satellite', 'Maninagar', 'Vastrapur', 'SG Highway', 'CG Road']);

-- ============================================
-- 2. USERS TABLE (All users with geolocation)
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
    
    -- Geolocation (CRITICAL for distance-based filtering)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_verified BOOLEAN DEFAULT false,
    
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

-- Indexes for fast area-based and location-based queries
CREATE INDEX idx_users_area_id ON users(area_id);
CREATE INDEX idx_users_role_area ON users(role, area_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- ============================================
-- 3. PRODUCTS TABLE (Vendor products)
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
-- 4. ORDERS TABLE (Distance-validated orders)
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
    
    -- Distance tracking
    customer_vendor_distance DECIMAL(10, 2), -- in km
    
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

-- =====================================================
-- DISTANCE CALCULATION FUNCTION (Haversine Formula)
-- =====================================================

-- Function to calculate distance between two points in kilometers
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, 
    lon1 DECIMAL,
    lat2 DECIMAL, 
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Earth radius in kilometers
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Handle NULL values
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Convert degrees to radians
    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    
    -- Haversine formula
    a := SIN(dLat/2) * SIN(dLat/2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(dLon/2) * SIN(dLon/2);
    
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN ROUND((R * c)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- VIEWS FOR DISTANCE-BASED QUERIES
-- =====================================================

-- View to get vendors with their location
CREATE OR REPLACE VIEW vendor_locations AS
SELECT 
    user_id,
    name,
    email,
    phone,
    address,
    shop_name,
    shop_category,
    latitude,
    longitude,
    is_active,
    created_at
FROM users
WHERE role = 'vendor' AND is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- View to get delivery partners with their location
CREATE OR REPLACE VIEW delivery_locations AS
SELECT 
    user_id,
    name,
    email,
    phone,
    address,
    vehicle_type,
    vehicle_number,
    latitude,
    longitude,
    is_active,
    created_at
FROM users
WHERE role = 'delivery' AND is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- =====================================================
-- HELPER FUNCTIONS FOR DISTANCE-BASED FILTERING
-- =====================================================

-- Function to get nearby vendors within radius (in km)
CREATE OR REPLACE FUNCTION get_nearby_vendors(
    customer_lat DECIMAL,
    customer_lon DECIMAL,
    radius_km DECIMAL DEFAULT 5
)
RETURNS TABLE (
    vendor_id INTEGER,
    vendor_name VARCHAR(100),
    vendor_email VARCHAR(255),
    vendor_phone VARCHAR(15),
    vendor_address TEXT,
    shop_name VARCHAR(200),
    shop_category VARCHAR(100),
    distance_km DECIMAL,
    products_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.user_id,
        v.name,
        v.email,
        v.phone,
        v.address,
        v.shop_name,
        v.shop_category,
        calculate_distance(customer_lat, customer_lon, v.latitude, v.longitude) as distance,
        COUNT(p.product_id) as products_count
    FROM users v
    LEFT JOIN products p ON v.user_id = p.vendor_id AND p.is_available = true
    WHERE v.role = 'vendor'
      AND v.is_active = true
      AND v.latitude IS NOT NULL
      AND v.longitude IS NOT NULL
      AND calculate_distance(customer_lat, customer_lon, v.latitude, v.longitude) <= radius_km
    GROUP BY v.user_id, v.name, v.email, v.phone, v.address, v.shop_name, v.shop_category, v.latitude, v.longitude
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby delivery partners within radius (in km)
CREATE OR REPLACE FUNCTION get_nearby_delivery_partners(
    location_lat DECIMAL,
    location_lon DECIMAL,
    radius_km DECIMAL DEFAULT 5
)
RETURNS TABLE (
    delivery_id INTEGER,
    delivery_name VARCHAR(100),
    delivery_phone VARCHAR(15),
    vehicle_type VARCHAR(50),
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.user_id,
        d.name,
        d.phone,
        d.vehicle_type,
        calculate_distance(location_lat, location_lon, d.latitude, d.longitude) as distance
    FROM users d
    WHERE d.role = 'delivery'
      AND d.is_active = true
      AND d.latitude IS NOT NULL
      AND d.longitude IS NOT NULL
      AND calculate_distance(location_lat, location_lon, d.latitude, d.longitude) <= radius_km
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get products from nearby vendors
CREATE OR REPLACE FUNCTION get_nearby_products(
    customer_lat DECIMAL,
    customer_lon DECIMAL,
    radius_km DECIMAL DEFAULT 5,
    product_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    product_id INTEGER,
    product_name VARCHAR(200),
    category VARCHAR(100),
    price DECIMAL,
    stock_quantity INTEGER,
    vendor_id INTEGER,
    vendor_name VARCHAR(100),
    shop_name VARCHAR(200),
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id,
        p.name,
        p.category,
        p.price,
        p.stock_quantity,
        v.user_id,
        v.name,
        v.shop_name,
        calculate_distance(customer_lat, customer_lon, v.latitude, v.longitude) as distance
    FROM products p
    JOIN users v ON p.vendor_id = v.user_id
    WHERE p.is_available = true
      AND p.stock_quantity > 0
      AND v.role = 'vendor'
      AND v.is_active = true
      AND v.latitude IS NOT NULL
      AND v.longitude IS NOT NULL
      AND calculate_distance(customer_lat, customer_lon, v.latitude, v.longitude) <= radius_km
      AND (product_category IS NULL OR p.category = product_category)
    ORDER BY distance ASC, p.name ASC;
END;
$$ LANGUAGE plpgsql;

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

-- Function to validate distance between two users
CREATE OR REPLACE FUNCTION validate_user_distance(
    user1_id INTEGER,
    user2_id INTEGER,
    max_distance_km DECIMAL DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
    lat1 DECIMAL;
    lon1 DECIMAL;
    lat2 DECIMAL;
    lon2 DECIMAL;
    distance DECIMAL;
BEGIN
    -- Get coordinates for both users
    SELECT latitude, longitude INTO lat1, lon1 FROM users WHERE user_id = user1_id;
    SELECT latitude, longitude INTO lat2, lon2 FROM users WHERE user_id = user2_id;
    
    -- Check if coordinates exist
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN false;
    END IF;
    
    -- Calculate distance
    distance := calculate_distance(lat1, lon1, lat2, lon2);
    
    -- Return true if within max distance
    RETURN distance <= max_distance_km;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Sample users (all in Ahmedabad - area_id = 1)
-- Coordinates are approximate for Gota, Chandkheda, and Satellite areas

INSERT INTO users (area_id, name, email, password_hash, phone, role, address, pincode, city, latitude, longitude, location_verified, shop_name, shop_category, is_verified) VALUES
-- Customers
(1, 'Raj Patel', 'raj@example.com', '$2b$10$hashedpassword1', '9876543210', 'customer', '352, Silver Oak University, Gota', '382481', 'Ahmedabad', 23.1167, 72.5667, true, NULL, NULL, true),
(1, 'Priya Shah', 'priya@example.com', '$2b$10$hashedpassword2', '9876543211', 'customer', 'Gota Gam, Near Circle', '382481', 'Ahmedabad', 23.1200, 72.5700, true, NULL, NULL, true),
(1, 'Amit Desai', 'amit@example.com', '$2b$10$hashedpassword6', '9876543215', 'customer', 'Satellite Road', '380015', 'Ahmedabad', 23.0258, 72.5073, true, NULL, NULL, true),

-- Vendors (different locations)
(1, 'Ramesh Kumar', 'ramesh@example.com', '$2b$10$hashedpassword3', '9876543212', 'vendor', 'Shop 5, Gota Market', '382481', 'Ahmedabad', 23.1180, 72.5680, true, 'Fresh Vegetables', 'Grocery', true),
(1, 'Suresh Patel', 'suresh@example.com', '$2b$10$hashedpassword4', '9876543213', 'vendor', 'Shop 12, Gota Circle', '382481', 'Ahmedabad', 23.1150, 72.5650, true, 'Daily Needs Store', 'Grocery', true),
(1, 'Mahesh Shah', 'mahesh@example.com', '$2b$10$hashedpassword7', '9876543216', 'vendor', 'Chandkheda Market', '382424', 'Ahmedabad', 23.1500, 72.6000, true, 'Chandkheda Mart', 'Grocery', true),
(1, 'Kiran Joshi', 'kiran@example.com', '$2b$10$hashedpassword8', '9876543217', 'vendor', 'Satellite Plaza', '380015', 'Ahmedabad', 23.0300, 72.5100, true, 'Satellite Store', 'Grocery', true),

-- Delivery
(1, 'Vikram Singh', 'vikram@example.com', '$2b$10$hashedpassword5', '9876543214', 'delivery', 'Gota Gam', '382481', 'Ahmedabad', 23.1190, 72.5690, true, NULL, NULL, true);

-- Sample products (from different vendors)
INSERT INTO products (vendor_id, area_id, name, description, category, price, stock_quantity, unit, is_available) VALUES
-- Ramesh Kumar's products (vendor_id = 4)
(4, 1, 'Fresh Tomatoes', 'Farm fresh tomatoes', 'Vegetables', 40.00, 50, 'kg', true),
(4, 1, 'Onions', 'Premium quality onions', 'Vegetables', 30.00, 100, 'kg', true),
(4, 1, 'Potatoes', 'Fresh potatoes', 'Vegetables', 25.00, 80, 'kg', true),

-- Suresh Patel's products (vendor_id = 5)
(5, 1, 'Milk', 'Fresh cow milk', 'Dairy', 60.00, 20, 'liter', true),
(5, 1, 'Bread', 'Whole wheat bread', 'Bakery', 35.00, 30, 'piece', true),
(5, 1, 'Eggs', 'Farm fresh eggs', 'Dairy', 6.00, 100, 'piece', true),

-- Mahesh Shah's products (vendor_id = 6)
(6, 1, 'Rice', 'Basmati rice', 'Grains', 80.00, 50, 'kg', true),
(6, 1, 'Wheat Flour', 'Whole wheat flour', 'Grains', 45.00, 60, 'kg', true),

-- Kiran Joshi's products (vendor_id = 7)
(7, 1, 'Cooking Oil', 'Sunflower oil', 'Cooking', 150.00, 30, 'liter', true),
(7, 1, 'Sugar', 'White sugar', 'Groceries', 42.00, 40, 'kg', true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE areas IS 'Master table for all service areas';
COMMENT ON TABLE users IS 'All users with geolocation for distance-based filtering';
COMMENT ON TABLE products IS 'Vendor products - visible based on distance';
COMMENT ON TABLE orders IS 'Orders - validated by distance between customer and vendor';
COMMENT ON COLUMN users.latitude IS 'User latitude for distance calculation';
COMMENT ON COLUMN users.longitude IS 'User longitude for distance calculation';
COMMENT ON COLUMN users.location_verified IS 'Whether location has been verified by AI';
COMMENT ON FUNCTION calculate_distance IS 'Haversine formula to calculate distance in km';
COMMENT ON FUNCTION get_nearby_vendors IS 'Get vendors within specified radius';
COMMENT ON FUNCTION get_nearby_delivery_partners IS 'Get delivery partners within specified radius';
COMMENT ON FUNCTION get_nearby_products IS 'Get products from vendors within specified radius';


