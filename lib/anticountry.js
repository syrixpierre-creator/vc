// QUEEN AKUMA v3.5.0 • lib/anticountry.js (bot-md _anti212.mjs se — bug fixed)
// Anti-212/265 auto-ban: in country codes wale numbers group join karte hi
// kick ho jate hain (onGroupUpdate hook). Source bug fixed: bot-md me
// `'212' || '212'` sirf 212 check karta tha, 265 kabhi match nahi hota tha.
// Unban path: exceptions list — .anticountry unban <number>.
// Store: data/anticountry.json { enabled, codes: ['212','265'], exceptions: [] }.
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'anticountry.json');

function load() {
  try {
    const d = JSON.parse(fs.readFileSync(STORE, 'utf8'));
    return { enabled: !!d.enabled, codes: Array.isArray(d.codes) && d.codes.length ? d.codes : ['212', '265'], exceptions: Array.isArray(d.exceptions) ? d.exceptions : [] };
  } catch (_) { return { enabled: false, codes: ['212', '265'], exceptions: [] }; }
}
let state = load();
function save() { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(state, null, 2)); } catch (_) {} }
function get() { return state; }
function setEnabled(v) { state.enabled = !!v; save(); }
function numberOf(jid) { return String(jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, ''); }
function codeOf(jid) { return state.codes.find((c) => numberOf(jid).startsWith(c)) || null; }
function isExcepted(jid) { return state.exceptions.includes(numberOf(jid)); }
function addException(num) {
  const n = String(num).replace(/[^0-9]/g, '');
  if (n && !state.exceptions.includes(n)) { state.exceptions.push(n); save(); return true; }
  return false;
}
function removeException(num) {
  const n = String(num).replace(/[^0-9]/g, '');
  const before = state.exceptions.length;
  state.exceptions = state.exceptions.filter((x) => x !== n);
  if (state.exceptions.length !== before) { save(); return true; }
  return false;
}
// Message-level block: banned-code sender bot use nahi kar sakta.
function isBlockedSender(senderId, isSenderAdmin) {
  if (!state.enabled) return false;
  if (isSenderAdmin) return false;
  if (!codeOf(senderId)) return false;
  if (isExcepted(senderId)) return false;
  return true;
}
module.exports = { get, setEnabled, codeOf, isExcepted, addException, removeException, isBlockedSender, numberOf };
