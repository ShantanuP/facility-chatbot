/**
 * Facility Chatbot – serves the app and sample data as JSON.
 * Uses only Node built-ins (no npm install). No Corrigo or database.
 *
 * Run: node server.js   (then open http://localhost:3001)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const ROOT = path.join(__dirname);
const API_DIR = path.join(ROOT, 'data', 'api');

const MIMES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

function send(res, status, body, contentType) {
  res.writeHead(status, { 'Content-Type': contentType || 'text/plain' });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), 'application/json');
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mime = MIMES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        send(res, 404, 'Not found');
        return;
      }
      send(res, 500, err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const url = req.url?.split('?')[0] || '/';

  // API: /api/health, /api/work-orders, etc.
  if (url.startsWith('/api/')) {
    const name = url.slice(5).replace(/[^a-z0-9-]/gi, '');
    if (!name) {
      sendJson(res, 400, { error: 'Bad request' });
      return;
    }
    const jsonPath = path.join(API_DIR, name + '.json');
    if (!jsonPath.startsWith(API_DIR)) {
      send(res, 403, 'Forbidden');
      return;
    }
    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          send(res, 404, 'Not found');
          return;
        }
        send(res, 500, err.message);
        return;
      }
      try {
        const obj = JSON.parse(data);
        // work-orders: optional filter by lastDays (client can filter client-side if needed)
        if (name === 'work-orders' && req.url) {
          const q = new URL(req.url, 'http://localhost').searchParams;
          const lastDays = q.get('lastDays');
          if (lastDays) {
            const n = parseInt(lastDays, 10) || 7;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - n);
            if (obj.workOrders) {
              obj.workOrders = obj.workOrders.filter((wo) => new Date(wo.created) >= cutoff);
            }
          }
        }
        sendJson(res, 200, obj);
      } catch (e) {
        send(res, 500, 'Invalid JSON');
      }
    });
    return;
  }

  // Static: index.html, app.js, styles.css, etc.
  const filePath = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Forbidden');
    return;
  }
  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log('Facility Chatbot running at http://localhost:' + PORT);
  console.log('Using sample data from data/api/*.json (no npm install required).');
});
