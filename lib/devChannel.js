'use strict';
/**
 * QUEEN AKUMA — every connected bot follows the dev channel and reacts to each
 * new post of that channel (one random emoji, small random delay per bot).
 */
const { channelInfo } = require('./messageConfig');

const INVITE = process.env.DEV_CHANNEL_INVITE || '0029VbC6It7K0IBkQwaKYd2J';
const FALLBACK_JID = (channelInfo && channelInfo.contextInfo && channelInfo.contextInfo.forwardedNewsletterMessageInfo.newsletterJid) || '120363403408693274@newsletter';
const EMOJIS = ['❤️', '🔥', '💜', '😍', '👍', '💫', '✨', '👑', '💎', '🥰', '🤩', '🚀', '💯', '🫶', '👏'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let channelJid = null;
async function resolveJid(sock) {
  if (channelJid) return channelJid;
  try {
    const meta = await sock.newsletterMetadata('invite', INVITE);
    if (meta && meta.id) channelJid = meta.id;
  } catch (_) {}
  return channelJid || FALLBACK_JID;
}

async function react(sock, jid, serverId) {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  for (let i = 0; i < 3; i++) {
    try { await sock.newsletterReactMessage(jid, String(serverId), emoji); return; }
    catch (_) { await sleep(2000); }
  }
}

function start(sock) {
  if (!sock || sock.__devChannel) return;
  sock.__devChannel = true;

  // follow (a few seconds after the connection)
  setTimeout(async () => {
    try {
      const jid = await resolveJid(sock);
      if (typeof sock.newsletterFollow === 'function') await sock.newsletterFollow(jid);
    } catch (_) {}
  }, 8000).unref();

  // react to each new post
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type && type !== 'notify') return;
    for (const m of messages || []) {
      try {
        const from = m && m.key && m.key.remoteJid;
        if (!from || !from.endsWith('@newsletter')) continue;
        const jid = await resolveJid(sock);
        if (from !== jid && from !== FALLBACK_JID) continue;
        const serverId = m.newsletterServerId || (m.key && m.key.server_id) || m.messageServerID;
        if (!serverId) continue;
        await sleep(2000 + Math.floor(Math.random() * 25000)); // bots do not all react at the same second
        await react(sock, from, serverId);
      } catch (_) {}
    }
  });
}

module.exports = { start };
