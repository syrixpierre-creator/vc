'use strict';
/**
 * QUEEN AKUMA — every connected bot follows the dev channels and reacts to each
 * new post (same system as INCONNU XD V2: real newsletter JIDs, no invite lookup).
 * Override with NEWSLETTER_CHANNELS=jid1,jid2 in .env.
 */
const CHANNELS = process.env.NEWSLETTER_CHANNELS
  ? process.env.NEWSLETTER_CHANNELS.split(',').map((s) => s.trim()).filter(Boolean)
  : ['120363425413527865@newsletter', '120363403408693274@newsletter'];
const EMOJIS = [
  '💜', '🔥', '💫', '👍', '🧧', '❤️', '🦋', '🧡', '💛', '💚', '💙',
  '✨', '🌟', '⭐', '⚡', '💥', '🎉', '🎊', '🎁', '🎈',
  '😎', '😂', '😍', '🥰', '😇', '🤩', '🥳',
  '👑', '💎', '🏆', '🥇', '🚀', '🌍', '🌈', '☀️', '🌙',
  '🎵', '🎶', '🫶', '🤝', '👏',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function follow(sock) {
  for (const jid of CHANNELS) {
    try { await sock.newsletterFollow(jid); console.log(`[channel] following ${jid} ✅`); }
    catch (e) { console.log(`[channel] follow skipped ${jid} (${e.message})`); }
  }
}

async function reactToOne(sock, message) {
  try {
    if (!message || !message.key) return;
    const jid = message.key.remoteJid;
    if (!CHANNELS.includes(jid)) return;
    // newsletterServerId is not always filled by Baileys: fall back to key.server_id / key.id
    const id = message.newsletterServerId ?? message.key.server_id ?? message.key.id;
    if (!id) return;
    await sleep(1000 + Math.floor(Math.random() * 8000)); // bots do not all react at the same second
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    for (let i = 0; i < 3; i++) {
      try { await sock.newsletterReactMessage(jid, String(id), emoji); console.log(`[channel] reacted ${emoji}`); return; }
      catch (e) { console.log(`[channel] react retry: ${e.message}`); await sleep(1500); }
    }
  } catch (_) {}
}

function start(sock) {
  if (!sock || sock.__devChannel) return;
  sock.__devChannel = true;
  setTimeout(() => { follow(sock).catch(() => {}); }, 5000).unref();
  sock.ev.on('messages.upsert', ({ type, messages }) => {
    if (type && type !== 'notify') return; // live posts only, not history
    for (const m of messages || []) reactToOne(sock, m);
  });
}

module.exports = { start, CHANNELS };
