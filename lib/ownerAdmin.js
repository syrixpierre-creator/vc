'use strict';
/**
 * QUEEN AKUMA v3.6.0 — owner / group-admin check for protection toggles.
 *
 * Pattern: command/menu3.js .menutheme lock (NOT `adminOnly: true` —
 * dispatcher ki adminOnly branch me isBotAdmin bhi require hota hai, isliye
 * group admin tab bhi toggle nahi kar pata jab bot admin na ho; aur
 * context.isSenderAdmin us branch ke bina false rehta hai — yehi .unban
 * bug tha). Isliye toggle files apne SET branch me ye helper call karti
 * hain; STATUS dekhna public rehta hai.
 *
 * Rules:
 *  - owner (fromMe / senderIsOwnerOrSudo / isOwnerOrSudoCheck) → hamesha allow
 *  - group me → group admin allow (lib/isAdmin se check)
 *  - DM me (non-group) → sirf owner allow
 */
const isAdmin = require('./isAdmin');

async function canToggle(sock, message, context = {}) {
  try {
    if (message.key?.fromMe) return true;
    if (context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck) return true;
    const chatId = context.chatId || message.key?.remoteJid || '';
    if (!String(chatId).endsWith('@g.us')) return false; // DM: sirf owner
    const senderId = context.senderId || message.key?.participant || message.key?.remoteJid;
    const st = await isAdmin(sock, chatId, senderId);
    return !!st.isSenderAdmin;
  } catch (_) {
    return false;
  }
}

module.exports = { canToggle };
