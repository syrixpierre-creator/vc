// QUEEN AKUMA v3.5.0 • lib/auditLog.js (queen-akuma auditlog.js se)
// Admin action audit log: kick/promote/demote/settings — last 200 per group.
// data/auditlog.json me save hota hai. global.logAction bhi expose karta hai
// taaki doosre modules actions log kar sakein.
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'auditlog.json');

function loadLogs() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch (_) { return {}; }
}
function saveLogs(data) {
  try {
    fs.mkdirSync(path.dirname(STORE), { recursive: true });
    fs.writeFileSync(STORE, JSON.stringify(data, null, 2));
  } catch (_) {}
}

const auditLogs = loadLogs();
let saveTimer = null;
function saveSoon() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = null; saveLogs(auditLogs); }, 10000);
}

function logAction(jid, action, actor, target, details = '') {
  if (!jid || !jid.endsWith('@g.us')) return;
  if (!auditLogs[jid]) auditLogs[jid] = [];
  auditLogs[jid].push({
    action, actor, actorNum: actor ? actor.split('@')[0] : 'bot',
    target: target || null, targetNum: target ? target.split('@')[0] : null,
    details, timestamp: Date.now(),
  });
  if (auditLogs[jid].length > 200) auditLogs[jid] = auditLogs[jid].slice(-200);
  saveSoon();
}
function getLogs(jid) { return auditLogs[jid] || []; }

global.auditLogs = auditLogs;
global.logAction = logAction;

module.exports = { logAction, getLogs, auditLogs };
