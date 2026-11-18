'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Group metadata cache (WA Mini Bot #4 port, extended).
 * Har group command / admin check pehle `sock.groupMetadata(jid)` ka
 * network call karta tha. Ab har connection (main + .addbot/.rentbot
 * clones) ka groupMetadata 60s TTL cache se chalta hai — mini bot ki
 * tarah per-session cache, `groups.update` / `group-participants.update`
 * par invalidate.
 *
 * Pehle ye cache sirf index.js me inline tha (main sock only) aur
 * lib/isAdmin.js ka apna alag 20s cache tha — clones ka metadata
 * kabhi cache nahi hota tha. Ab ek hi shared lib, ek hi TTL (60s),
 * ek hi invalidation path; isAdmin bhi isi par chalta hai.
 */
const TTL_MS = 60 * 1000;
const MAX_ENTRIES = 300;

// Wrapped socks ka registry — isAdmin.clearCache (koi caller nahi hai,
// compat ke liye rakha hai) yahan se saare socks ki cache saaf karta hai.
const wrappedSocks = new Set();

function getCache(sock) {
  if (!sock.__gmCache) sock.__gmCache = new Map();
  return sock.__gmCache;
}

function invalidate(sock, jid) {
  try {
    if (sock && sock.__gmCache && jid) sock.__gmCache.delete(jid);
  } catch (_) {}
}

function clearAll(jid) {
  for (const sock of wrappedSocks) {
    try {
      if (!sock.__gmCache) continue;
      if (jid) sock.__gmCache.delete(jid);
      else sock.__gmCache.clear();
    } catch (_) {}
  }
}

// Idempotent — ek sock par do baar call karna safe hai.
function wrapGroupMetadata(sock) {
  if (!sock || typeof sock.groupMetadata !== 'function') return sock;
  if (sock.__gmWrapped) return sock;
  sock.__gmWrapped = true;
  const raw = sock.groupMetadata.bind(sock);
  sock.__gmRawGroupMetadata = raw;
  sock.__gmCache = new Map();
  wrappedSocks.add(sock);

  sock.groupMetadata = async (jid, ...rest) => {
    const cache = getCache(sock);
    const hit = cache.get(jid);
    if (hit && Date.now() - hit.t < TTL_MS) return hit.v;
    const v = await raw(jid, ...rest);
    // Failures cache nahi hote — error throw hoga, agli baar retry.
    cache.set(jid, { v: v, t: Date.now() });
    if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value);
    return v;
  };

  // Mini-bot jaisa invalidation: group info ya members badle to cache hatao.
  try {
    if (sock.ev && typeof sock.ev.on === 'function') {
      sock.ev.on('groups.update', (u) => (u || []).forEach((g) => g && g.id && invalidate(sock, g.id)));
      sock.ev.on('group-participants.update', (u) => u && u.id && invalidate(sock, u.id));
    }
  } catch (_) {}
  return sock;
}

module.exports = { TTL_MS, MAX_ENTRIES, wrapGroupMetadata, invalidate, clearAll };
