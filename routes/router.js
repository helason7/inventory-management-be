const url = require('url');
const InventoryManager = require('../controllers/InventoryManager');

const inventory = new InventoryManager();

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function router(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;
  const method = req.method;

  try {
    // === Produk ===
    if (method === 'POST' && pathname === '/products') {
      const data = await parseBody(req);
      const result = await inventory.addProduct(data.name, data.price, data.stock, data.category);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    if (method === 'GET' && pathname === '/products') {
      const category = query.category;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const offset = (page - 1) * limit;

      let products;
      if (category) {
        products = await inventory.getProductsByCategory(category);
      } else {
        const [rows] = await require('../database/db').query(
          'SELECT * FROM products LIMIT ? OFFSET ?', [limit, offset]
        );
        products = rows;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(products));
    }

    if (method === 'PUT' && pathname.startsWith('/products/')) {
      const id = pathname.split('/')[2];
      const data = await parseBody(req);
      await require('../database/db').query(
        'UPDATE products SET ? WHERE product_id = ?', [data, id]
      );
      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'Product updated' }));
    }

    // === Transaksi ===
    if (method === 'POST' && pathname === '/transactions') {
      const data = await parseBody(req);
      const result = await inventory.createTransaction(
        data.productId, data.quantity, data.type, data.customerId, data.supplierId
      );
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // === Report ===
    if (method === 'GET' && pathname === '/reports/inventory') {
      const value = await inventory.getInventoryValue();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ totalInventoryValue: value }));
    }

    if (method === 'GET' && pathname === '/reports/low-stock') {
      const [rows] = await require('../database/db').query(
        'SELECT * FROM products WHERE stock < 5'
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    }

    // === Customers ===
    if (method === 'POST' && pathname === '/customers') {
      const data = await parseBody(req);
      const result = await inventory.addCustomer(data.name, data.category);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }


    if (method === 'GET' && pathname === '/customers') {
      const category = query.category;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const offset = (page - 1) * limit;

      let customers;
      if (category) {
        customers = await inventory.getCustomersByCategory(category);
      } else {
        const [rows] = await require('../database/db').query(
          'SELECT * FROM customers LIMIT ? OFFSET ?', [limit, offset]
        );
        customers = rows;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(customers));
    }

    // === Suppliers ===
    if (method === 'POST' && pathname === '/suppliers') {
      const data = await parseBody(req);
      const result = await inventory.addSupplier(data.name);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // === Dashboard Sales Per MOnth ===
    if (method === 'GET' && pathname === '/dashboard/sales-per-month') {
    const { start, end } = query
      const [rows] = await require('../database/db').query(
        `SELECT
            DATE_FORMAT(transaction_date, '%b') AS name,
            SUM(total_payment) AS value
        FROM transactions
        WHERE transaction_date BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(transaction_date, '%b')
        ORDER BY name`, [start, end]
      );
    //   const data = {
    //     salesPerMonth: rows
    //   } 
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    }

    // === Dashboard Sales Per Group ===
    if (method === 'GET' && pathname === '/dashboard/sales-per-group') {
    const { start, end } = query
      const [rows] = await require('../database/db').query(
        `SELECT
            p.category name,
            SUM(t.total_payment) AS value
            FROM transactions t
            JOIN products p ON t.product_id = p.product_id
            WHERE t.transaction_date BETWEEN ? AND ?
            GROUP BY p.category
            ORDER BY value DESC`, [start, end]
      );
    //   const data = {
    //     salesPerGroup: rows
    //   } 
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    }

    // === Dashboard Sales Per Top Ten ===
    if (method === 'GET' && pathname === '/dashboard/top-products') {
    const { start, end } = query
      const [rows] = await require('../database/db').query(
        `SELECT
            p.name ,
            SUM(t.quantity ) AS value
            FROM transactions t
            JOIN products p ON t.product_id = p.product_id
            WHERE t.transaction_date BETWEEN ? AND ?
            GROUP BY p.product_id, p.name
            ORDER BY value DESC
            LIMIT 10`, [start, end]
      );
    //   const data = {
    //     topProducts: rows
    //   } 
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    }

    // Default jika tidak ditemukan
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));

  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

module.exports = router;
