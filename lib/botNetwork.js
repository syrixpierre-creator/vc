'use strict';
/**
 * QUEEN AKUMA — link between the bots of one server (multi-session).
 *
 * Under manager.js every bot is its own process. A bot can ask the manager:
 *  - to make EVERY connected bot react to a channel post (.channelreact): each bot
 *    reacts with its own WhatsApp account and the manager answers how many reacted;
 *  - for the pairing code of a number (.pair).
 * Outside the manager (single bot), only this bot reacts and .pair is unavailable.
 */
const IS_MANAGED = process.env.DEMON_MANAGED === '1' && typeof process.send === 'function';
const pending = new Map();
let sockRef = null;

function setSock(sock) { sockRef = sock; }

async function reactOnce(sock, jid, postId, emoji) {
  if (!sock) throw new Error('not connected');
  const fn = sock.newsletterReactMessage || sock.newsletterReact;
  if (typeof fn !== 'function') throw new Error('newsletter reactions not supported');
  let last;
  for (let i = 0; i < 3; i++) {
    try { await fn.call(sock, jid, String(postId), emoji); return true; }
    catch (e) { last = e; await new Promise((r) => setTimeout(r, 1500)); }
  }
  throw last;
}

if (IS_MANAGED) {
  process.on('message', async (msg) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'chreact-result' || msg.type === 'pair-result') {
      const done = pending.get(msg.id);
      if (done) { pending.delete(msg.id); done(msg); }
    } else if (msg.type === 'mem-report') {
      // memory diagnostic (manager /health/mem)
      const mu = process.memoryUsage();
      let groups = 0;
      try { groups = sockRef && sockRef.__gmCache ? sockRef.__gmCache.size : 0; } catch (_) {}
      const pkgs = {};
      for (const f of Object.keys(require.cache)) {
        const m = f.match(/node_modules[\\/](@[^\\/]+[\\/][^\\/]+|[^\\/]+)/);
        if (m) pkgs[m[1]] = (pkgs[m[1]] || 0) + 1;
      }
      try {
        process.send({ type: 'mem-result', id: msg.id, rss: mu.rss, heapUsed: mu.heapUsed, heapTotal: mu.heapTotal,
          external: mu.external, arrayBuffers: mu.arrayBuffers, modules: Object.keys(require.cache).length,
          packages: Object.keys(pkgs), groups, uptime: Math.round(process.uptime()) });
      } catch (_) {}
    } else if (msg.type === 'chreact-do') {
      let ok = false;
      try { ok = await reactOnce(sockRef, msg.jid, msg.postId, msg.emoji); } catch (_) {}
      try { process.send({ type: 'chreact-done', id: msg.id, ok }); } catch (_) {}
    }
  });
}

/** Make every connected bot react. Resolves to { ok, total }. */
function channelReactAll({ jid, postId, emojis }, sock) {
  if (sock && !sockRef) sockRef = sock;
  if (!IS_MANAGED) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    return reactOnce(sockRef || sock, jid, postId, emoji).then(() => ({ ok: 1, total: 1 }), () => ({ ok: 0, total: 1 }));
  }
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return new Promise((resolve) => {
    const timer = setTimeout(() => { pending.delete(id); resolve({ ok: 0, total: 0, timeout: true }); }, 180000);
    pending.set(id, (m) => { clearTimeout(timer); resolve({ ok: m.ok || 0, total: m.total || 0 }); });
    process.send({ type: 'chreact-request', id, jid, postId: String(postId), emojis });
  });
}

/** Ask the manager for a pairing code. Resolves to { ok, code } or { ok:false, error }. */
function requestPairCode(number) {
  if (!IS_MANAGED) return Promise.resolve({ ok: false, error: 'not-managed' });
  const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return new Promise((resolve) => {
    const timer = setTimeout(() => { pending.delete(id); resolve({ ok: false, error: 'timeout' }); }, 75000);
    pending.set(id, (m) => { clearTimeout(timer); resolve(m); });
    process.send({ type: 'pair-request', id, number: String(number) });
  });
}

module.exports = { IS_MANAGED, setSock, channelReactAll, requestPairCode };
