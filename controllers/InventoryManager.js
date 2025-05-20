// File: InventoryManager.js
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class InventoryManager {
  // Tambah produk baru dengan ID otomatis
  async addProduct(name, price, stock, category) {
    const product_id = uuidv4();
    await db.query(
      'INSERT INTO products SET ?', 
      { product_id, name, price, stock, category }
    );
    return { product_id, name, price, stock, category };
  }

  // Tambah pelanggan baru dengan ID otomatis
  async addCustomer(name, category) {
    const customer_id = uuidv4();
    await db.query(
      'INSERT INTO customers SET ?', 
      { customer_id, name, category }
    );
    return { customer_id, name, category };
  }

  // Tambah supplier baru dengan ID otomatis
  async addSupplier(name) {
    const supplier_id = uuidv4();
    await db.query(
      'INSERT INTO suppliers SET ?', 
      { supplier_id, name }
    );
    return { supplier_id, name };
  }

  // Update stok produk berdasarkan tipe transaksi
  async updateStock(productId, quantity, transactionType) {
    // Ambil produk dari DB
    const [rows] = await db.query(
      'SELECT stock FROM products WHERE product_id = ?', 
      [productId]
    );
    if (rows.length === 0) {
      throw new Error('Product not found');
    }
    const currentStock = rows[0].stock;
    let newStock;
    if (transactionType === 'purchase') {
      newStock = currentStock + quantity;
    } else if (transactionType === 'sale') {
      console.log('qty: ', quantity)
      newStock = currentStock - quantity;
    } else {
      throw new Error('Invalid transaction type');
    }
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }
    await db.query(
      'UPDATE products SET stock = ? WHERE product_id = ?', 
      [newStock, productId]
    );
    return newStock;
  }

  async purchasing(supplierId, productId, quantity, type){
    // Update stok sesuai transaksi
    await this.updateStock(productId, quantity, type);
    // Simpan transaksi
    await db.query(
      'INSERT INTO transactions SET ?', 
      { customer_id, product_id: productId, quantity, type, 
        supplier_id: supplierId, total_payment, transaction_date: new Date() }
    );
    return { supplier_id, productId, quantity, type, 
      customerId, total_payment, transaction_date: new Date() };

  }

  // Catat transaksi pembelian/penjualan
  async createTransaction(productId, quantity, type, customerId = null, supplierId = null) {
    // Validasi tipe
    if (type !== 'purchase' && type !== 'sale') {
      throw new Error('Invalid transaction type');
    }
    // Periksa produk
    const [prodRows] = await db.query(
      'SELECT price FROM products WHERE product_id = ?', 
      [productId]
    );
    if (prodRows.length === 0) {
      throw new Error('Product not found');
    }
    const price = prodRows[0].price;
    let discount = 0;
    // Jika penjualan, pastikan stok cukup
    if (type === 'sale') {
      const [stockRows] = await db.query(
        'SELECT stock FROM products WHERE product_id = ?', 
        [productId]
      );
      if (stockRows[0].stock < quantity) {
        throw new Error('Insufficient stock');
      }
      // Hitung diskon jika pelanggan premium
      if (customerId) {
        const [custRows] = await db.query(
          'SELECT category FROM customers WHERE customer_id = ?', 
          [customerId]
        );
        if (custRows.length === 0) {
          throw new Error('Customer not found');
        }
        if (custRows[0].category === 'premium') {
          discount = 0.10;
        }
      }
    }else{
      const [suppRows] = await db.query(
        'SELECT * FROM suppliers WHERE supplier_id = ?', 
        [supplierId]
      );
      if (suppRows.length === 0) {
        throw new Error('Supplier not found');
      }
      // return await this.purchasing(supplierId, productId, quantity, type);
      
    }
    const total_payment = price * quantity * (1 - discount);
    // Update stok sesuai transaksi
    await this.updateStock(productId, quantity, type);
    // Simpan transaksi
    const transaction_id = uuidv4();
    await db.query(
      'INSERT INTO transactions SET ?', 
      { transaction_id, product_id: productId, quantity, type, 
        customer_id: customerId, supplier_id: supplierId, total_payment, 
        transaction_date: new Date() }
    );
    return { transaction_id, productId, quantity, type, 
      customerId, supplierId, total_payment, transaction_date: new Date() };
  }

  // Ambil produk berdasarkan kategori
  async getProductsByCategory(category) {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE category = ?', 
      [category]
    );
    return rows;
  }

  // Ambil customer berdasarkan kategori
  async getCustomersByCategory(category) {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE category = ?', 
      [category]
    );
    return rows;
  }

  // Hitung total nilai inventaris (sum of price * stock)
  async getInventoryValue() {
    const [rows] = await db.query(
      'SELECT SUM(price * stock) AS value FROM products'
    );
    return rows[0].value || 0;
  }

  // Ambil riwayat transaksi untuk produk tertentu
  async getProductHistory(productId) {
    const [rows] = await db.query(
      'SELECT * FROM transactions WHERE product_id = ?', 
      [productId]
    );
    return rows;
  }
}

module.exports = InventoryManager;
