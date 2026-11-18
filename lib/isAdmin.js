/**
 * Fast + robust admin check (phone JID + LID).
 * Metadata caching: lib/groupMetaCache.js — har sock ka groupMetadata
 * 60s TTL cache se chalta hai (main + clones). Ye file apna alag cache
 * nahi rakhti; getMeta pehle sock ko wrap kar leta hai (idempotent).
 */
const { wrapGroupMetadata, clearAll } = require('./groupMetaCache');

async function getMeta(sock, chatId) {
  wrapGroupMetadata(sock);
  return sock.groupMetadata(chatId);
}

async function isAdmin(sock, chatId, senderId) {
  try {
    const metadata = await getMeta(sock, chatId);
    const participants = metadata.participants || [];

    const strip = (j) => (!j ? '' : String(j).split('@')[0].split(':')[0]);
    const digits = (j) => strip(j).replace(/\D/g, '');
    const same = (a, b) => {
      if (!a || !b) return false;
      if (a === b) return true;
      const sa = strip(a), sb = strip(b);
      if (sa && sb && sa === sb) return true;
      const da = digits(a), db = digits(b);
      return !!(da && db && da.length >= 8 && da === db);
    };

    const collectIds = (p) => {
      const out = [];
      if (!p) return out;
      if (typeof p === 'string') return [p];
      for (const k of ['id', 'jid', 'lid', 'phoneNumber', 'participant']) {
        if (p[k]) out.push(p[k]);
      }
      return out;
    };

    const isAdminRole = (p) => {
      const a = p && p.admin;
      return a === 'admin' || a === 'superadmin' || a === true;
    };

    const botIds = [sock.user?.id, sock.user?.lid, sock.user?.jid].filter(Boolean);
    for (const b of [...botIds]) {
      const s = strip(b);
      if (s) {
        botIds.push(s + '@s.whatsapp.net');
        botIds.push(s + '@lid');
      }
    }

    let isBotAdmin = false;
    let isSenderAdmin = false;

    for (const p of participants) {
      const ids = collectIds(p);
      const admin = isAdminRole(p);
      if (!admin) continue;
      for (const bid of botIds) {
        for (const id of ids) {
          if (same(bid, id)) { isBotAdmin = true; break; }
        }
        if (isBotAdmin) break;
      }
      for (const id of ids) {
        if (same(senderId, id)) { isSenderAdmin = true; break; }
      }
    }

    // fallback: sender matches any admin participant loosely
    if (!isSenderAdmin) {
      for (const p of participants) {
        if (!isAdminRole(p)) continue;
        for (const id of collectIds(p)) {
          if (same(senderId, id)) { isSenderAdmin = true; break; }
        }
        if (isSenderAdmin) break;
      }
    }

    return { isSenderAdmin, isBotAdmin, participants };
  } catch (e) {
    console.error('[isAdmin]', e.message);
    return { isSenderAdmin: false, isBotAdmin: false, participants: [] };
  }
}

// allow cache bust after promote/demote (delegates to shared cache)
isAdmin.clearCache = (chatId) => {
  try { clearAll(chatId); } catch (_) {}
};

module.exports = isAdmin;
