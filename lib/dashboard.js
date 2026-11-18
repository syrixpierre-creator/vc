/**
 * QUEEN AKUMA v3.0.0 — Live Dashboard stats
 * Har successful command yahan record hota hai; /dashboard page
 * aur /api/stats endpoint isse padhte hain. Sab local JSON me.
 */
const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'dashboard.json');
const BOOT_TIME = Date.now();

function load() {
  try { return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')); }
  catch (_) { return { totalCommands: 0, commands: {}, recent: [] }; }
}
function save(store) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch (_) {}
}
function recordCommand(name, chatId) {
  try {
    const store = load();
    store.totalCommands = (store.totalCommands || 0) + 1;
    store.commands[name] = (store.commands[name] || 0) + 1;
    store.recent = [{ name, at: Date.now(), chat: String(chatId || '').replace(/@.*$/, '') }, ...(store.recent || [])].slice(0, 20);
    save(store);
  } catch (_) {}
}
function getStats() {
  const store = load();
  const top = Object.entries(store.commands || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  let version = '3.0.0';
  try { version = require('../package.json').version || version; } catch (_) {}
  const up = Math.floor((Date.now() - BOOT_TIME) / 1000);
  return {
    version, uptimeSec: up,
    uptime: `${Math.floor(up / 3600)}h ${Math.floor((up % 3600) / 60)}m ${up % 60}s`,
    totalCommands: store.totalCommands || 0,
    topCommands: top,
    recent: store.recent || [],
    time: new Date().toISOString()
  };
}
module.exports = { recordCommand, getStats, BOOT_TIME };
