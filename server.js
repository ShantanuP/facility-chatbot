/**
 * Facility Chatbot – serves the app, sample data JSON, and optional Databricks SQL.
 * Run: node server.js   (then open http://localhost:3001)
 *
 * Databricks: set from command line or .env (no browser needed):
 *   SERVER_HOSTNAME=adb-xxx.azuredatabricks.net HTTP_PATH=/sql/1.0/warehouses/yyy ACCESS_TOKEN=dapi... node server.js
 * Or create a .env file in this folder with SERVER_HOSTNAME, HTTP_PATH, ACCESS_TOKEN.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const ROOT = path.join(__dirname);
const API_DIR = path.join(ROOT, 'data', 'api');

// Load optional .env from project root (KEY=VALUE per line)
try {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) {
        const val = m[2].replace(/^["']|["']$/g, '').trim();
        process.env[m[1]] = val;
      }
    });
  }
} catch (_) {}

// Databricks credentials: from env / .env (command line) or POST /api/databricks-connect (browser)
let databricksCreds = null;
if (process.env.SERVER_HOSTNAME && process.env.HTTP_PATH && process.env.ACCESS_TOKEN) {
  databricksCreds = {
    serverHostname: process.env.SERVER_HOSTNAME.trim(),
    httpPath: process.env.HTTP_PATH.trim(),
    accessToken: process.env.ACCESS_TOKEN.trim(),
  };
}

function parseWarehouseId(httpPath) {
  if (!httpPath || typeof httpPath !== 'string') return null;
  const segments = httpPath.replace(/^\//, '').split('/').filter(Boolean);
  return segments.length ? segments[segments.length - 1] : null;
}

function databricksRequest(host, path, token, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: host.replace(/^https?:\/\//, '').split('/')[0],
      port: 443,
      path: path || '/api/2.0/sql/statements',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(opts, (res) => {
      let buf = '';
      res.on('data', (ch) => { buf += ch; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(buf || '{}'));
        } catch (e) {
          reject(new Error('Invalid JSON from Databricks'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function rowsFromResult(apiResult) {
  const result = apiResult?.result;
  if (!result?.data_array?.length) return [];
  const schema = result?.manifest?.schema?.columns || [];
  const colNames = schema.map((c) => (c.name || '').toLowerCase());
  return result.data_array.map((row) => {
    const obj = {};
    row.forEach((val, i) => {
      const name = colNames[i] || ('col' + i);
      obj[name] = val;
    });
    return obj;
  });
}

async function queryDatabricks(statement) {
  if (!databricksCreds) return null;
  const warehouseId = parseWarehouseId(databricksCreds.httpPath);
  if (!warehouseId) return null;
  const hostname = databricksCreds.serverHostname
    .replace(/^https?:\/\//, '')
    .split('/')[0];
  const res = await databricksRequest(
    hostname,
    '/api/2.0/sql/statements',
    databricksCreds.accessToken,
    { warehouse_id: warehouseId, statement }
  );
  if (res.status?.state === 'FAILED') {
    throw new Error(res.status?.error_description || res.status?.state || 'Query failed');
  }
  return rowsFromResult(res);
}

function mapWorkOrders(rows) {
  return {
    workOrders: rows.map((r) => ({
      id: r.work_order_number || r.work_order_id || '',
      title: r.work_order_description || '',
      status: r.work_order_status || '',
      priority: r.work_order_priority || '',
      site: r.work_order_workzone_name || r.workzone_name || '',
      created: (r.work_order_datetime_created || '').toString().split(' ')[0] || '',
    })),
  };
}

function mapWorkOrdersByStatus(rows) {
  return {
    byStatus: rows.map((r) => ({
      status: r.status || r.work_order_status || 'Unknown',
      count: parseInt(r.count || r.cnt || 0, 10) || 0,
    })),
  };
}

function mapAssets(rows) {
  return {
    assets: rows.map((r) => ({
      id: 'AST-' + (r.asset_id || ''),
      name: r.asset_name || '',
      type: r.asset_category || 'Asset',
      location: r.workzone_name || '',
    })),
  };
}

function mapAssetsByCost(rows) {
  return {
    assets: rows.map((r) => ({
      id: 'AST-' + (r.asset_id || ''),
      name: r.asset_name || '',
      cost: parseFloat(r.cumulative_total_spend || r.cost || 0) || 0,
    })),
  };
}

function mapLocations(rows) {
  return {
    locations: rows.map((r) => ({
      id: 'LOC-' + (r.property_id || ''),
      name: r.workzone_name || '',
      address: r.workzone_address_1 || '',
      workOrderCount: parseInt(r.work_order_count || r.cnt || 0, 10) || 0,
    })),
  };
}

function mapMaintenance(rows) {
  return {
    upcoming: rows.map((r) => ({
      asset: r.schedule_name || r.pmrm_asset_name || '',
      date: (r.pmrm_next_occurrence_date || r.next_date || '').toString().split(' ')[0] || '',
      type: r.pmrm_specialty || 'Maintenance',
    })),
  };
}

const DATABRICKS_QUERIES = {
  'work-orders': `SELECT work_order_number, work_order_description, work_order_status, work_order_priority, work_order_workzone_name, work_order_datetime_created FROM workorders ORDER BY work_order_datetime_created DESC`,
  'work-orders-by-status': `SELECT work_order_status AS status, COUNT(*) AS count FROM workorders GROUP BY work_order_status ORDER BY count DESC`,
  'assets': `SELECT a.asset_id, a.asset_name, a.asset_category, p.workzone_name FROM assets a LEFT JOIN properties p ON a.property_id = p.property_id ORDER BY a.asset_name`,
  'assets-by-cost': `SELECT asset_id, asset_name, cumulative_total_spend FROM assets WHERE cumulative_total_spend IS NOT NULL AND cumulative_total_spend > 0 ORDER BY cumulative_total_spend DESC LIMIT 10`,
  'locations': `SELECT p.property_id, p.workzone_name, p.workzone_address_1, (SELECT COUNT(*) FROM workorders w WHERE w.property_id = p.property_id) AS work_order_count FROM properties p ORDER BY p.workzone_name`,
  'maintenance': `SELECT schedule_name, pmrm_next_occurrence_date, pmrm_specialty FROM pmrm_schedules WHERE (pmrm_suspend = 0 OR pmrm_suspend IS NULL) AND pmrm_next_occurrence_date >= current_date() ORDER BY pmrm_next_occurrence_date LIMIT 20`,
};

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (ch) => { body += ch; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url?.split('?')[0] || '/';

  // POST /api/databricks-connect – store Databricks credentials
  if (req.method === 'POST' && url === '/api/databricks-connect') {
    try {
      const body = await readBody(req);
      const json = JSON.parse(body || '{}');
      const { serverHostname, httpPath, accessToken } = json;
      if (!serverHostname || !httpPath || !accessToken) {
        sendJson(res, 400, { error: 'Missing serverHostname, httpPath, or accessToken' });
        return;
      }
      databricksCreds = {
        serverHostname: serverHostname.trim(),
        httpPath: httpPath.trim(),
        accessToken: accessToken.trim(),
      };
      sendJson(res, 200, { ok: true, message: 'Databricks connected' });
    } catch (e) {
      sendJson(res, 400, { error: e.message || 'Invalid JSON' });
    }
    return;
  }

  // GET /api/* – serve data (Databricks if connected, else static JSON)
  if (req.method === 'GET' && url.startsWith('/api/')) {
    const name = url.slice(5).replace(/[^a-z0-9-]/gi, '');
    if (!name) {
      sendJson(res, 400, { error: 'Bad request' });
      return;
    }

    // Health: report whether Databricks is configured
    if (name === 'health') {
      sendJson(res, 200, {
        ok: true,
        source: databricksCreds ? 'databricks' : 'sample data (JSON)',
      });
      return;
    }

    const sqlQuery = DATABRICKS_QUERIES[name];
    if (databricksCreds && sqlQuery) {
      try {
        const rows = await queryDatabricks(sqlQuery);
        let data;
        if (name === 'work-orders') {
          const q = new URL(req.url || '', 'http://localhost').searchParams;
          const lastDays = q.get('lastDays');
          let list = mapWorkOrders(rows).workOrders;
          if (lastDays) {
            const n = parseInt(lastDays, 10) || 7;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - n);
            list = list.filter((wo) => new Date(wo.created || 0) >= cutoff);
          }
          data = { workOrders: list };
        } else if (name === 'work-orders-by-status') data = mapWorkOrdersByStatus(rows);
        else if (name === 'assets') data = mapAssets(rows);
        else if (name === 'assets-by-cost') data = mapAssetsByCost(rows);
        else if (name === 'locations') data = mapLocations(rows);
        else if (name === 'maintenance') data = mapMaintenance(rows);
        else data = {};
        sendJson(res, 200, data);
      } catch (err) {
        console.error('Databricks query error:', err.message);
        sendJson(res, 502, { error: err.message || 'Databricks query failed' });
      }
      return;
    }

    // Static JSON fallback
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

  // Static files
  const filePath = path.join(ROOT, url === '/' ? 'index.html' : url);
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Forbidden');
    return;
  }
  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log('Facility Chatbot running at http://localhost:' + PORT);
  if (databricksCreds) {
    console.log('Databricks: connected (SERVER_HOSTNAME, HTTP_PATH, ACCESS_TOKEN from env or .env)');
  } else {
    console.log('Using sample data from data/api/*.json. To use Databricks: set env vars or add .env');
  }
});
