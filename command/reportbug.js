/**
 * QUEEN AKUMA v3.5.0 • #41 .reportbug — user ki bug report / feature request
 * seedha saare owner numbers ko forward karta hai (TKM-bot se).
 * Usage: .reportbug <tumhari report>
 */
const settings = require('../settings');

function ownerJids() {
  const nums = [];
  const push = (n) => {
    const s = String(n || '').replace(/[^0-9]/g, '');
    if (s) nums.push(s + '@s.whatsapp.net');
  };
  if (Array.isArray(settings.ownerNumber)) settings.ownerNumber.forEach(push);
  else if (settings.ownerNumber) push(settings.ownerNumber);
  try {
    const extra = require('../data/owner.json');
    if (Array.isArray(extra)) extra.forEach(push);
    else if (extra && Array.isArray(extra.owner)) extra.owner.forEach(push);
  } catch (_) {}
  return [...new Set(nums)];
}

module.exports = {
  command: 'reportbug',
  aliases: ['request', 'bugreport'],
  category: 'main',
  description: 'Report a bug or request a feature — goes straight to the owners',
  usage: '.reportbug <your report>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = context.senderId || message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    if (!text) {
      return reply('🐞 *Report a Bug / Request a Feature*\n\nUsage: `.reportbug <tumhari report>`\n\nExample: `.reportbug .menu photo nahi aa rahi`');
    }
    const owners = ownerJids();
    if (!owners.length) return reply('❌ Owner number configured nahi hai — report nahi bheji ja sakti.');
    const who = sender.split('@')[0];
    const isGroup = !!context.isGroup;
    const body = `🐞 *Bug Report / Feature Request*\n\n👤 From: @${who}\n💬 Chat: ${isGroup ? 'Group' : 'DM'}\n\n${text}`;
    let sent = 0;
    for (const oj of owners) {
      try { await sock.sendMessage(oj, { text: body, mentions: [sender] }); sent++; } catch (_) {}
    }
    if (!sent) return reply('❌ Report owners tak nahi pahunch payi. Baad me try karo.');
    return reply('✅ Report bhej di gayi! Owner jald dekh lega. 🙏');
  },
};
