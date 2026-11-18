const fs = require('fs');
const path = require('path');
const LOG = path.join(process.cwd(), 'data', 'error-log.json');
const MAX = 100;

function push(err, meta = {}) {
  try {
    const dir = path.dirname(LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let arr = [];
    if (fs.existsSync(LOG)) {
      try { arr = JSON.parse(fs.readFileSync(LOG, 'utf8')); } catch { arr = []; }
    }
    arr.unshift({
      ts: new Date().toISOString(),
      msg: String(err && err.message ? err.message : err).slice(0, 300),
      ...meta
    });
    arr = arr.slice(0, MAX);
    fs.writeFileSync(LOG, JSON.stringify(arr, null, 2));
  } catch (_) {}
}

function list(n = 15) {
  try {
    if (!fs.existsSync(LOG)) return [];
    return JSON.parse(fs.readFileSync(LOG, 'utf8')).slice(0, n);
  } catch {
    return [];
  }
}

module.exports = { push, list };
