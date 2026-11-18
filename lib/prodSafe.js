/**
 * QUEEN AKUMA — Production safety helpers
 * Safe for KataBump / Pterodactyl / Railway / VPS / panel hosts
 */
const fs = require('fs');
const path = require('path');

function ensureDirs() {
  for (const d of ['data', 'tmp', 'session']) {
    const p = path.join(process.cwd(), d);
    try {
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    } catch (_) {}
  }
}

/** Prevent accidental mass file writes */
function softWrite(file, data) {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, data);
    return true;
  } catch (e) {
    console.error('[prodSafe.write]', e.message);
    return false;
  }
}

function limitStore(map, max = 500) {
  if (!map || typeof map.size !== 'number') return;
  if (map.size <= max) return;
  const keys = [...map.keys()].slice(0, map.size - max);
  for (const k of keys) map.delete(k);
}

module.exports = { ensureDirs, softWrite, limitStore };
