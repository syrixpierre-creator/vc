// QUEEN AKUMA v3.5.0 • lib/onlyadmin.js — #7 .onlyadmin store (per-group)
// data/onlyadmin.json { chatId: true }. In-memory cache.
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'onlyadmin.json');
function load() { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch (_) { return {}; } }
let state = load();
function save() { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(state, null, 2)); } catch (_) {} }
function isOn(chatId) { return !!state[chatId]; }
function set(chatId, on) { if (on) state[chatId] = true; else delete state[chatId]; save(); }
module.exports = { isOn, set };
