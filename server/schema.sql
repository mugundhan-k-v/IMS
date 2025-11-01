-- Schema for Inventory Management System
CREATE DATABASE IF NOT EXISTS ims_db;
USE ims_db;

CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(50),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  quantity INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00,
  supplier_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Simple users table to support login (no hashing, no tokens)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  role ENUM('owner','supplier') NOT NULL DEFAULT 'supplier',
  supplier_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Notifications table: stores alerts generated when stock is low
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  supplier_id INT DEFAULT NULL,
  message VARCHAR(1024) NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Add triggers to generate low-stock notifications when products are inserted or updated
DELIMITER $$
CREATE TRIGGER trg_products_after_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
  -- If a new product is already at or below min_stock, create a notification
  IF NEW.min_stock IS NOT NULL AND NEW.quantity <= NEW.min_stock THEN
    INSERT INTO notifications (product_id, supplier_id, message)
    VALUES (NEW.id, NEW.supplier_id, CONCAT('Low stock for product ', NEW.name, ': quantity=', NEW.quantity, ', min=', NEW.min_stock));
  END IF;
END$$

CREATE TRIGGER trg_products_after_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  -- Only notify when the quantity crosses from above min_stock to at/below min_stock
  IF NEW.min_stock IS NOT NULL AND OLD.quantity > NEW.min_stock AND NEW.quantity <= NEW.min_stock THEN
    INSERT INTO notifications (product_id, supplier_id, message)
    VALUES (NEW.id, NEW.supplier_id, CONCAT('Low stock for product ', NEW.name, ': quantity=', NEW.quantity, ', min=', NEW.min_stock));
  END IF;
END$$
DELIMITER ;

-- Seed a default inventory owner (username: owner / password: owner)
INSERT INTO users (username, password, display_name, role) 
SELECT 'owner', 'owner', 'Inventory Owner', 'owner' 
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='owner');

-- Seed a sample supplier and supplier user (if not present)
INSERT INTO suppliers (name, contact, address)
SELECT 'Acme Supplies', 'acme@example.com', '123 Supply St' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name='Acme Supplies');

-- Ensure a supplier user exists and is linked to the supplier
INSERT INTO users (username, password, display_name, role, supplier_id)
SELECT 'acme', 'acme', 'Acme Supplier', 'supplier', s.id
FROM (SELECT id FROM suppliers WHERE name='Acme Supplies' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='acme');

-- Seed some products, including one intentionally below min_stock to demonstrate notifications
INSERT INTO products (name, category, quantity, min_stock, price, supplier_id)
SELECT 'Widget A', 'Widgets', 5, 10, 9.99, s.id
FROM (SELECT id FROM suppliers WHERE name='Acme Supplies' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Widget A');

INSERT INTO products (name, category, quantity, min_stock, price, supplier_id)
SELECT 'Gadget B', 'Gadgets', 20, 5, 19.99, s.id
FROM (SELECT id FROM suppliers WHERE name='Acme Supplies' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Gadget B');

-- When the above INSERT for 'Widget A' runs, the insert trigger will create a notification because quantity (5) <= min_stock (10).

-- Additional demo suppliers and products for testing
INSERT INTO suppliers (name, contact, address)
SELECT 'Global Parts Co', 'global@example.com', '456 Global Ave' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name='Global Parts Co');

INSERT INTO suppliers (name, contact, address)
SELECT 'Local Components', 'local@example.com', '789 Local Rd' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name='Local Components');

-- Add supplier users for the new suppliers
INSERT INTO users (username, password, display_name, role, supplier_id)
SELECT 'global', 'global', 'Global Supplier', 'supplier', s.id
FROM (SELECT id FROM suppliers WHERE name='Global Parts Co' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='global');

INSERT INTO users (username, password, display_name, role, supplier_id)
SELECT 'local', 'local', 'Local Supplier', 'supplier', s.id
FROM (SELECT id FROM suppliers WHERE name='Local Components' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='local');

-- Add more products (some intentionally low-stock)
INSERT INTO products (name, category, quantity, min_stock, price, supplier_id)
SELECT 'Sprocket X', 'Components', 2, 5, 4.50, s.id
FROM (SELECT id FROM suppliers WHERE name='Global Parts Co' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Sprocket X');

INSERT INTO products (name, category, quantity, min_stock, price, supplier_id)
SELECT 'Bearing Y', 'Components', 50, 10, 1.25, s.id
FROM (SELECT id FROM suppliers WHERE name='Global Parts Co' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Bearing Y');

INSERT INTO products (name, category, quantity, min_stock, price, supplier_id)
SELECT 'Nut M', 'Hardware', 0, 20, 0.10, s.id
FROM (SELECT id FROM suppliers WHERE name='Local Components' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Nut M');

INSERT INTO products (name, category, quantity, min_stock, price, supplier_id)
SELECT 'Bolt N', 'Hardware', 30, 15, 0.15, s.id
FROM (SELECT id FROM suppliers WHERE name='Local Components' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Bolt N');

-- Notes: the insert triggers will create notifications for Sprocket X and Nut M because their quantity <= min_stock.
