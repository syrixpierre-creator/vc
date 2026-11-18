/** QUEEN AKUMA tiny JSON storage helper (./data/<name>.json) */
const fs = require('fs');
const path = require('path');

const DIR = path.join(process.cwd(), 'data');
const cache = new Map();

function file(name) {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  return path.join(DIR, `${name}.json`);
}

function load(name, fallback = {}) {
  if (cache.has(name)) return cache.get(name);
  let data;
  try { data = JSON.parse(fs.readFileSync(file(name), 'utf8')); }
  catch { data = JSON.parse(JSON.stringify(fallback)); }
  cache.set(name, data);
  return data;
}

function save(name) {
  if (!cache.has(name)) return;
  try { fs.writeFileSync(file(name), JSON.stringify(cache.get(name), null, 2)); }
  catch (e) { console.error(`[jsondb] save ${name}:`, e.message); }
}

module.exports = { load, save };
