// QUEEN AKUMA v3.5.0 • lib/groupAnalytics.js (queen-akuma group-analytics.js se)
// Group message stats: total messages, top members, peak hours.
// In-memory Map + debounced disk save (data/groupAnalytics.json).
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'groupAnalytics.json');

let analytics = new Map();
try {
  const d = JSON.parse(fs.readFileSync(STORE, 'utf8'));
  for (const [k, v] of Object.entries(d || {})) analytics.set(k, v);
} catch (_) {}

let saveTimer = null;
function saveSoon() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.mkdirSync(path.dirname(STORE), { recursive: true });
      fs.writeFileSync(STORE, JSON.stringify(Object.fromEntries(analytics), null, 2));
    } catch (_) {}
  }, 5000);
}

function trackMessage(jid, sender) {
  if (!jid || !jid.endsWith('@g.us')) return;
  if (!analytics.has(jid)) analytics.set(jid, { members: {}, hourly: new Array(24).fill(0), totalMessages: 0, since: Date.now() });
  const data = analytics.get(jid);
  data.totalMessages++;
  data.hourly[new Date().getHours()]++;
  if (!data.members[sender]) data.members[sender] = { count: 0, lastSeen: 0 };
  data.members[sender].count++;
  data.members[sender].lastSeen = Date.now();
  saveSoon();
}

function getStats(jid) { return analytics.get(jid) || null; }
function topUsers(jid, n = 15) {
  const data = analytics.get(jid);
  if (!data) return [];
  return Object.entries(data.members).sort((a, b) => b[1].count - a[1].count).slice(0, n);
}
function formatDuration(ms) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}
function makeBar(val, max, len = 10) {
  const filled = max > 0 ? Math.round((val / max) * len) : 0;
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

module.exports = { trackMessage, getStats, topUsers, formatDuration, makeBar, analytics };
