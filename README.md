# Inventory Management REST API (Node.js + MySQL)

API untuk mengelola produk, transaksi, pelanggan, dan supplier. Dibuat sebagai bagian dari ujian Fullstack Programmer.

---

## 🚀 Fitur

- Tambah, update, dan list produk
- Manajemen stok otomatis saat transaksi
- Pencatatan transaksi (penjualan/pembelian)
- Manajemen pelanggan dan supplier
- Diskon otomatis berdasarkan kategori pelanggan
- Pagination dan filter kategori untuk produk
- Laporan nilai inventory & stok rendah

---

## 📦 Teknologi

- Node.js (tanpa framework)
- MySQL
- UUID (untuk generate ID unik)
- `mysql` NPM module

---

## 📁 Struktur Folder
inventory-api/
├── controllers/
│ └── InventoryManager.js
├── database/
│ ├── db.js
│ └── database.sql
├── routes/
│ └── router.js
├── server.js
└── README.md


---

## 🛠️ Instalasi

1. **Clone repo dan install dependensi**
```bash
npm install

npm run dev
# atau
node server.js

Server berjalan di: http://localhost:3000

#PRODUCTS
- POST /products
tambah product
Body:
{
  "name": "Kopi ABC",
  "price": 15000,
  "stock": 20,
  "category": "minuman"
}

- GET /products?page=1&limit=10
List produk dengan pagination
Tambahkan &category=minuman untuk filter

- PUT /products/:id
Update produk berdasarkan ID
Body bisa berisi field yang ingin diubah

#TRANSACTIONS
POST /transactions
body:
{
  "productId": "uuid-produk",
  "quantity": 2,
  "type": "sale", // hanya terdapat 2 value sale atau purchase
  "customerId": "uuid-customer", // diisi null jika type = purchase
  "supllierId": "uuid-customer", // dapat diisi null jika type = sale
}

#Customer & Supplier
POST /customers
Tambah pelanggan
{
  "name": "John Doe",
  "category": "premium"
}

POST /suppliers
Tambah supplier
{
  "name": "PT Sumber Jaya"
}

🔹 Report
GET /reports/inventory
Total nilai semua stok (price × stock)

GET /reports/low-stock
Daftar produk dengan stok di bawah 5

❗ Validasi & Error Handling
Stok tidak bisa negatif saat transaksi sale

Diskon hanya untuk customer kategori premium

Semua ID di-generate otomatis (UUID)

Error akan dibalas dalam bentuk:
{ "error": "Pesan error" }

######SQL######
Struktur Table ada pada file table.sql