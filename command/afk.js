/**
 * QUEEN AKUMA • .afk — Real AFK status (v2.8.6, replaces smartRun stub)
 * .afk <reason> -> AFK ON (data/afk.json). Koi tumhe mention karega to bot
 * bata dega. Tum koi message bhejoge to AFK auto-off + welcome back.
 * .afk (bina reason) -> tumhara AFK status dikhata hai.
 */
const fs = require('fs');
const path = require('path');
const afkPath = path.join(__dirname, '../data/afk.json');
function loadAfk() { try { return JSON.parse(fs.readFileSync(afkPath, 'utf8')); } catch (_) { return {}; } }
function saveAfk(d) { try { fs.mkdirSync(path.dirname(afkPath), { recursive: true }); fs.writeFileSync(afkPath, JSON.stringify(d, null, 2)); } catch (_) {} }

module.exports = {
  command: 'afk',
  aliases: ['setafk'],
  category: 'main',
  description: 'Set AFK status — bot auto-replies when someone mentions you',
  usage: '.afk <reason>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = context.senderId || message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const reason = (args || []).join(' ').trim();
    const afk = loadAfk();
    if (!reason) {
      const me = afk[sender];
      if (me) return reply(`😴 Tum AFK ho since ${new Date(me.since).toLocaleString('en-IN')}.\nReason: ${me.reason || '—'}\nWapas aakar koi message bhejte hi AFK hat jayega.`);
      return reply('📌 *Usage:* .afk <reason>');
    }
    afk[sender] = { reason, since: Date.now() };
    saveAfk(afk);
    return reply(`😴 *AFK ON*\nReason: ${reason}\nKoi tumhe mention karega to bot bata dega tum AFK ho.`);
  },
  async onMessage(sock, message, context = {}) {
    const text = String(context.userMessage || context.messageText || '').trim();
    if (text.startsWith('.')) return false; // command hai, handler sambhalega
    const chatId = context.chatId || message.key.remoteJid;
    const sender = context.senderId || message.key.participant || message.key.remoteJid;
    const afk = loadAfk();
    if (afk[sender]) {
      const { reason, since } = afk[sender];
      delete afk[sender];
      saveAfk(afk);
      const mins = Math.max(1, Math.round((Date.now() - since) / 60000));
      try { await sock.sendMessage(chatId, { text: `👋 Welcome back! Tum ${mins} min se AFK the${reason ? ` (${reason})` : ''}.` }, { quoted: message }); } catch (_) {}
      return false;
    }
    const msg = message.message || {};
    const ctxInfo = (msg.extendedTextMessage && msg.extendedTextMessage.contextInfo)
      || (msg.imageMessage && msg.imageMessage.contextInfo)
      || (msg.videoMessage && msg.videoMessage.contextInfo) || {};
    const mentioned = ctxInfo.mentionedJid || [];
    const hit = mentioned.find((j) => afk[j]);
    if (hit) {
      const { reason, since } = afk[hit];
      const mins = Math.max(1, Math.round((Date.now() - since) / 60000));
      try { await sock.sendMessage(chatId, { text: `😴 @${hit.split('@')[0]} is AFK (${mins} min)${reason ? `: ${reason}` : ''}.`, mentions: [hit] }, { quoted: message }); } catch (_) {}
    }
    return false;
  }
};
