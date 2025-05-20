-- CREATE DATABASE IF NOT EXISTS inventory_db;
-- USE inventory_db;

-- Tabel Produk
CREATE TABLE products (
  product_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pelanggan
CREATE TABLE customers (
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- contoh: 'reguler', 'premium', dsb
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Supplier
CREATE TABLE suppliers (
  supplier_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transaksi
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) UNIQUE NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  type ENUM('purchase', 'sale') NOT NULL,
  customer_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Tabel Log Transaksi (opsional)
CREATE TABLE transaction_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- alter table transactions
add column supplier_id varchar(50);
add column total_payment DECIMAL(10,2);
add column transaction_date date;

