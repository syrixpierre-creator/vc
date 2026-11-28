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
const bc = require('./botContext');
// state of THIS bot: per process normally, per bot context in hub mode
const _local = { pending: new Map(), sockRef: null, attached: false };
function st() { const c = bc.current(); if (!c) return _local; return c.data.botnet || (c.data.botnet = { pending: new Map(), sockRef: null, attached: false }); }
function isManaged() { return process.env.DEMON_MANAGED === '1' && typeof process.send === 'function'; }

function setSock(sock) { st().sockRef = sock; attach(); }
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

// Messages from the manager (registered once per bot)
function attach() {
  const S = st();
  if (S.attached || !isManaged()) return;
  S.attached = true;
  process.on('message', async (msg) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'chreact-result' || msg.type === 'pair-result') {
      const done = S.pending.get(msg.id);
      if (done) { S.pending.delete(msg.id); done(msg); }
    } else if (msg.type === 'mem-report') {
      const mu = process.memoryUsage();
      try { process.send({ type: 'mem-result', id: msg.id, rss: mu.rss, heapUsed: mu.heapUsed, heapTotal: mu.heapTotal, external: mu.external, arrayBuffers: mu.arrayBuffers, modules: Object.keys(require.cache).length, packages: [], groups: 0, uptime: Math.round(process.uptime()) }); } catch (_) {}
    } else if (msg.type === 'chreact-do') {
      let ok = false;
      try { ok = await reactOnce(S.sockRef, msg.jid, msg.postId, msg.emoji); } catch (_) {}
      try { process.send({ type: 'chreact-done', id: msg.id, ok }); } catch (_) {}
    }
  });
}

/** Make every connected bot react. Resolves to { ok, total }. */
function channelReactAll({ jid, postId, emojis }, sock) {
  const S = st();
  if (sock && !S.sockRef) S.sockRef = sock;
  attach();
  if (!isManaged()) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    return reactOnce(S.sockRef || sock, jid, postId, emoji).then(() => ({ ok: 1, total: 1 }), () => ({ ok: 0, total: 1 }));
  }
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return new Promise((resolve) => {
    const timer = setTimeout(() => { S.pending.delete(id); resolve({ ok: 0, total: 0, timeout: true }); }, 180000);
    S.pending.set(id, (m) => { clearTimeout(timer); resolve({ ok: m.ok || 0, total: m.total || 0, cooldown: m.cooldown || 0 }); });
    process.send({ type: 'chreact-request', id, jid, postId: String(postId), emojis });
  });
}

/** Ask the manager for a pairing code. Resolves to { ok, code } or { ok:false, error }. */
function requestPairCode(number) {
  const S = st();
  attach();
  if (!isManaged()) return Promise.resolve({ ok: false, error: 'not-managed' });
  const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return new Promise((resolve) => {
    const timer = setTimeout(() => { S.pending.delete(id); resolve({ ok: false, error: 'timeout' }); }, 75000);
    S.pending.set(id, (m) => { clearTimeout(timer); resolve(m); });
    process.send({ type: 'pair-request', id, number: String(number) });
  });
}

module.exports = { get IS_MANAGED() { return isManaged(); }, setSock, channelReactAll, requestPairCode, attach };
