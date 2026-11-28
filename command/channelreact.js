'use strict';
/**
 * QUEEN AKUMA — .channelreact <post link> [emojis]
 * Every connected bot of this server reacts to the channel post (one emoji each).
 * The number of reactions = the number of active bots, nothing to type.
 */
const { channelReactAll } = require('../lib/botNetwork');

// cooldown is decided by the manager (30 min per bot); this is only a local guard
const COOLDOWN_MS = 30 * 60 * 1000;
let lastUse = 0;

function parseTarget(input) {
  const url = String(input || '').match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)\/(\d+)/i);
  if (url) return { invite: url[1], postId: url[2] };
  const jid = String(input || '').match(/(\d{8,}@newsletter)[\/\s:]+(\d+)/i);
  if (jid) return { jid: jid[1], postId: jid[2] };
  return null;
}

module.exports = {
  command: 'channelreact',
  aliases: [],
  category: 'owner',
  description: 'All active bots react to a channel post',
  usage: '.channelreact <post link> [emojis]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const input = (args || []).join(' ').trim();
    const target = parseTarget(input);
    if (!target) return reply('📌 *Usage:* .channelreact <post link> ❤️,🔥,😍');

    const rest = input.replace(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/\S+|\d{8,}@newsletter[\/\s:]+\d+/i, '');
    const emojis = [...new Set(rest.split(/[\s,]+/).map((e) => e.trim()).filter((e) => e && !/^[A-Za-z0-9]+$/.test(e) && e.length <= 16))].slice(0, 10);
    if (!emojis.length) emojis.push('❤️', '🔥', '😍', '👍');

    const wait = COOLDOWN_MS - (Date.now() - lastUse);
    if (wait > 0) return reply(`⏳ *Wait ${Math.ceil(wait / 60000)} min before the next reaction.*`);

    let jid = target.jid;
    try {
      if (!jid) {
        const meta = await sock.newsletterMetadata('invite', target.invite);
        jid = meta && meta.id;
      }
    } catch (_) {}
    if (!jid || !/@newsletter$/.test(jid)) return reply('❌ *Channel not found from this link.*');

    lastUse = Date.now();
    try { await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } }); } catch (_) {}
    const { ok, total, cooldown } = await channelReactAll({ jid, postId: target.postId, emojis }, sock);
    if (cooldown) {
      try { await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } }); } catch (_) {}
      return reply(`⏳ *You can use .channelreact again in ${cooldown} min.*`);
    }
    try { await sock.sendMessage(chatId, { react: { text: ok ? '✅' : '❌', key: message.key } }); } catch (_) {}
    if (!ok) { lastUse = 0; return reply(total ? '❌ *No bot could react. Try again later.*' : '❌ *No active bot.*'); }
    return reply(`✅ *${ok} bot${ok > 1 ? 's' : ''} reacted to the post.*`);
  },
};
