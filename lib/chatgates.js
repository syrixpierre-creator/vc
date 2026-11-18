// QUEEN AKUMA v3.5.0 • lib/chatgates.js (bot-md enable.mjs gates se)
// Global gates: pconly / gconly / swonly / nyimak / restrict.
// shouldBlock() ko lib/messageHandler.js dispatch se pehle call karta hai.
// In-memory cache (disk read har message par nahi — speed ke liye).
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'chatgates.json');

function load() { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch (_) { return {}; } }
let state = load();
function save() { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(state, null, 2)); } catch (_) {} }
function get() { return state; }
function set(key, val) { state[key] = !!val; save(); }

const GATE_CMDS = ['pconly', 'gconly', 'swonly', 'nyimak', 'restrict', 'onlyadmin'];

// Async — admin check sirf tab hota hai jab koi gate uski zaroorat rakhta hai
// (har message par groupMetadata call nahi — speed ke liye).
async function shouldBlock({ sock, chatId, isGroup, senderId, isOwnerOrSudoCheck, userMessage }) {
  if (isOwnerOrSudoCheck) return false;
  const text = String(userMessage || '').trim().toLowerCase();
  const invoked = text.replace(/^\./, '').split(/\s+/)[0];
  if (GATE_CMDS.includes(invoked)) return false; // gate commands kabhi block nahi
  if (state.nyimak) return true; // lurk mode — bot sirf padhta hai, jawab nahi deta
  if (state.swonly) return true; // status-only — group/DM me bot band
  if (state.pconly && isGroup) return true; // sirf DM
  if (state.gconly && !isGroup) return true; // sirf groups
  const isCmd = text.startsWith('.');
  let adminChecked = false; let isAdmin = false;
  async function checkAdmin() {
    if (adminChecked) return isAdmin;
    adminChecked = true;
    if (!isGroup) return false;
    try { const st = await require('./isAdmin')(sock, chatId, senderId); isAdmin = !!st.isSenderAdmin; } catch (_) { isAdmin = false; }
    return isAdmin;
  }
  if (state.restrict && isGroup && isCmd && !(await checkAdmin())) return true; // sirf admins commands chala sakte hain
  try {
    const oa = require('./onlyadmin');
    if (isGroup && oa.isOn(chatId) && isCmd && !(await checkAdmin())) return true;
  } catch (_) {}
  // anticountry message block (admins exempt)
  try {
    const ac = require('./anticountry');
    const s = ac.get();
    if (s.enabled && ac.codeOf(senderId) && !ac.isExcepted(senderId) && !(await checkAdmin())) return true;
  } catch (_) {}
  return false;
}

module.exports = { get, set, shouldBlock, GATE_CMDS };
