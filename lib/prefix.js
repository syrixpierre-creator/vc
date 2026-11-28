'use strict';
// Per-session prefix (like INCONNU XD .setprefix): saved in THIS bot's data/custom.json
// and applied immediately (no restart). In HUB mode settings/data are per bot.
const fs = require('fs');
const path = require('path');

const DEFAULT = ['.', '!', '/', '#'];
const file = () => path.join(process.cwd(), 'data', 'custom.json');
const settings = () => require('../settings');

function readCustom() { try { return JSON.parse(fs.readFileSync(file(), 'utf8')); } catch (_) { return {}; } }
function writeCustom(o) {
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(o, null, 2));
}

function getPrefix() {
  const p = settings().prefixes;
  return Array.isArray(p) && p.length ? p[0] : '.';
}
function setPrefix(p) {
  p = String(p || '').trim();
  if (!p) return resetPrefix();
  const list = p.split(/\s+/).filter(Boolean).slice(0, 5);
  const c = readCustom(); c.prefixes = list; writeCustom(c);
  settings().prefixes = list;
  return list[0];
}
function resetPrefix() {
  const c = readCustom(); delete c.prefixes; writeCustom(c);
  settings().prefixes = DEFAULT.slice();
  return DEFAULT[0];
}

module.exports = { getPrefix, setPrefix, resetPrefix, prefix: getPrefix };
