/**
 * Server tĩnh cho BrewLite — không cần dependency.
 * Chạy:  node serve.js   →  http://localhost:8080
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }
  if (urlPath === '/') urlPath = '/index.html';

  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { // chống path traversal
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>404 — Không tìm thấy trang</h1><p><a href="/">Về Menu</a></p>');
      return;
    }
    res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('BrewLite đang chạy → http://localhost:' + PORT);
});
