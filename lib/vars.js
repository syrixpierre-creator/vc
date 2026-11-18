/**
 * QUEEN AKUMA v3.4.0 — Vars from WhatsApp (Levanter #7)
 * data/vars.json: { KEY: "value" } — owner-only key/value store.
 * Note: ye bot ke live settings.js ko overwrite NAHI karta — ye ek
 * alag store hai jisse owner WhatsApp se values save/read kar sakta hai.
 */
const fs = require('fs');
const path = require('path');
const PATH = path.join(__dirname, '..', 'data', 'vars.json');
function load() { try { return JSON.parse(fs.readFileSync(PATH, 'utf8')); } catch (_) { return {}; } }
function save(d) { try { fs.mkdirSync(path.dirname(PATH), { recursive: true }); fs.writeFileSync(PATH, JSON.stringify(d, null, 2)); } catch (_) {} }
function set(key, value) { const d = load(); d[key.toUpperCase()] = String(value); save(d); return d[key.toUpperCase()]; }
function get(key) { return load()[key.toUpperCase()]; }
function del(key) { const d = load(); const k = key.toUpperCase(); if (!(k in d)) return false; delete d[k]; save(d); return true; }
function all() { return load(); }
module.exports = { load, save, set, get, del, all };
