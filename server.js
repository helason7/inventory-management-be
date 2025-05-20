const http = require('http');
const router = require('./routes/router');

// Buat server
const server = http.createServer((req, res) => {
  // Set header CORS agar bisa diakses dari frontend (opsional)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Panggil router
  router(req, res);
});

// Jalankan server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
