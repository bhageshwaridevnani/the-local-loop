-- The Local Loop Database Schema
-- PostgreSQL 14+

-- Users table (for all user types)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'vendor', 'delivery')),
    address TEXT NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    state VARCHAR(100) DEFAULT 'Maharashtra',
    area_name VARCHAR(255),
    area_validation_status VARCHAR(20) CHECK (area_validation_status IN ('approved', 'rejected', 'uncertain')),
    area_confidence DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor details
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    shop_type VARCHAR(50),
    commission_rate DECIMAL(4,2) DEFAULT 2.50,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery partners
CREATE TABLE delivery_partners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(50),
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(2,1) DEFAULT 0.0,
    total_deliveries INTEGER DEFAULT 0,
    earnings_total DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id),
    vendor_id INTEGER REFERENCES vendors(id),
    delivery_partner_id INTEGER REFERENCES delivery_partners(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 10.00,
    commission_amount DECIMAL(10,2),
    delivery_address TEXT NOT NULL,
    delivery_instructions TEXT,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Area validation logs
CREATE TABLE area_validations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    address TEXT NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    city VARCHAR(100) NOT NULL,
    validation_status VARCHAR(20) NOT NULL,
    confidence DECIMAL(3,2),
    pincode_score DECIMAL(3,2),
    address_score DECIMAL(3,2),
    geo_score DECIMAL(3,2),
    reasoning TEXT,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_pincode ON users(pincode);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);

-- Sample data for Area 1 (Andheri West, Mumbai)
INSERT INTO users (name, email, phone, password_hash, role, address, city, pincode, area_name, area_validation_status, area_confidence) VALUES
('Demo Vendor', 'vendor@demo.com', '9876543210', '$2b$10$demo_hash', 'vendor', 'Lokhandwala Complex', 'Mumbai', '400053', 'Andheri West, Mumbai', 'approved', 0.95),
('Demo Customer', 'customer@demo.com', '9876543211', '$2b$10$demo_hash', 'customer', 'Versova', 'Mumbai', '400053', 'Andheri West, Mumbai', 'approved', 0.92),
('Demo Delivery', 'delivery@demo.com', '9876543212', '$2b$10$demo_hash', 'delivery', 'Four Bungalows', 'Mumbai', '400053', 'Andheri West, Mumbai', 'approved', 0.88);
