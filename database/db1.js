const mysql = require('mysql');

// Konfigurasi koneksi database
const connection = mysql.createConnection({
  host: 'localhost',       // ganti jika host berbeda
  user: 'root',            // sesuaikan dengan user MySQL kamu
  password: '',            // sesuaikan dengan password kamu
  database: 'inventory_db' // harus sesuai dengan database yang kamu buat
});

// Koneksi ke database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1); // hentikan jika gagal
  }
  console.log('Connected to MySQL Database');
});

// Export koneksi untuk digunakan di file lain
module.exports = connection;
