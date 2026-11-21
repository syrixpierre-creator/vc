/**
 * QUEEN AKUMA v3.4.0 — Anti-Edit REWORKED (Levanter #3 + user requirement)
 * Ab har chat ka ALAG setup hai: group ka alag, DM ka alag.
 * - Group me: .antiedit on — sirf us group ke liye (admin/owner only)
 * - DM me: .antiedit on — sirf us DM ke liye (owner only)
 * - .antiedit status — is chat ka mode + kitne chats me on hai
 * - .antiedit default <on|indm|off> — owner-only, naye chats ke liye default
 * Modes: inchat (report usi chat me) / indm (report owner ke DM me) / off
 */
const db = require('../lib/jsondb');
const settings = require('../settings');

const NAME = 'antiedit';
const cache = new Map();          // message id -> { text, sender, chat }
const MAX = 3000;
const num = (j) => String(j || '').split(':')[0].split('@')[0];

function textOf(m) {
  if (!m) return '';
  const k = Object.keys(m).find(x => x !== 'messageContextInfo' && x !== 'senderKeyDistributionMessage') || '';
  const b = m[k];
  return typeof b === 'string' ? b : (b?.text || b?.caption || m.conversation || '');
}
function loadData() {
  const data = db.load(NAME, { chats: {}, default: 'off' });
  if (!data.chats) data.chats = {};
  // purana global mode migrate karo (ek baar)
  if (typeof data.mode === 'string') {
    data.default = data.mode === 'off' ? 'off' : data.mode;
    delete data.mode;
    db.save(NAME);
  }
  if (typeof data.default !== 'string') data.default = 'off';
  return data;
}
function modeFor(data, chatId) {
  return data.chats[chatId] || data.default || 'off';
}
async function isOwnerOrAdmin(sock, chatId, senderJid, isGroup) {
  try {
    const isOwner = require('../lib/isOwner');
    if (isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)) return true;
    if (await isOwner(senderJid, sock, chatId)) return true;
  } catch (_) {}
  if (!isGroup) return false;
  try {
    const meta = await sock.groupMetadata(chatId);
    const me = (meta.participants || []).find((p) => String(p.id).replace(/\D/g, '').endsWith(num(senderJid).slice(-10)));
    return !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
  } catch (_) { return false; }
}

module.exports = {
  command: 'antiedit',
  aliases: ['editdetect', 'noedit', 'setantiedit'],
  category: 'group',
  description: 'Edited message ka original dikhaye — har chat ka alag setup',
  usage: '.antiedit on|indm|off | .antiedit status',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const data = loadData();
    const sub = (args[0] || '').toLowerCase();
    const map = { on: 'inchat', inchat: 'inchat', chats: 'inchat', indm: 'indm', pm: 'indm', off: 'off', false: 'off' };

    if (sub === 'status') {
      const myMode = modeFor(data, chatId);
      const enabled = Object.values(data.chats).filter((m) => m !== 'off').length;
      return reply(`✅ *Anti-Edit: ${myMode.toUpperCase()}*\n\nAvailable options:\n- on\n- indm\n- off`);
    }
    if (sub === 'default') {
      let owner = false;
      try { const isOwner = require('../lib/isOwner'); owner = !!(isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)); } catch (_) {}
      if (!owner) return reply('🚫 *You are not authorized to use this command!*');
      const mode = map[(args[1] || '').toLowerCase()];
      if (!mode) return reply('❌ Usage: `.antiedit default on|indm|off`');
      data.default = mode;
      db.save(NAME);
      return reply(`✅ *Default mode set to: ${mode.toUpperCase()}*`);
    }
    if (!map[sub]) {
      const myMode = modeFor(data, chatId);
      return reply(`✅ *Anti-Edit: ${myMode.toUpperCase()}*\n\nAvailable options:\n- on\n- indm\n- off`);
    }
    if (!(await isOwnerOrAdmin(sock, chatId, senderJid, isGroup))) {
      return reply(isGroup ? '🚫 *You are not authorized to use this command!*' : '🚫 *You are not authorized to use this command!*');
    }
    const mode = map[sub];
    if (mode === 'off') {
      delete data.chats[chatId];
      // is chat ke cached messages bhi hatao
      for (const [id, v] of cache) if (v.chat === chatId) cache.delete(id);
    } else {
      data.chats[chatId] = mode;
    }
    db.save(NAME);
    return reply(`✅ *Anti-Edit ${mode === 'off' ? 'DISABLED' : 'ENABLED'}*`);
  },

  async onMessage(sock, message, ctx) {
    const chatId = ctx.chatId || message.key.remoteJid;
    const data = loadData();
    const mode = modeFor(data, chatId);
    if (mode === 'off') return;
    const msg = message.message || {};
    const pm = msg.protocolMessage || msg.editedMessage?.message?.protocolMessage;

    // an edit event
    if (pm && (pm.type === 14 || pm.type === 'MESSAGE_EDIT') && pm.editedMessage) {
      const id = pm.key?.id;
      const before = cache.get(id);
      const after = textOf(pm.editedMessage);
      if (!after || (before && before.text === after)) return;
      const sender = message.key.participant || message.key.remoteJid;
      const target = mode === 'indm' ? `${settings.ownerNumber}@s.whatsapp.net` : chatId;
      const where = ctx.isGroup ? `\n💬 Group: ${chatId.split('@')[0]}` : '\n💬 DM';
      await sock.sendMessage(target, {
        text: `✏️ *EDITED MESSAGE*\n👤 @${num(sender)}${where}\n\n*Before:* ${before ? before.text : '_(original not cached)_'}\n*After:* ${after}`,
        mentions: [sender]
      });
      if (before) before.text = after;
      return;
    }

    // remember normal text messages so an edit can be compared later
    if (message.key.fromMe) return;
    const t = textOf(msg);
    if (t && message.key.id) {
      cache.set(message.key.id, { text: t.slice(0, 1500), sender: message.key.participant, chat: chatId });
      if (cache.size > MAX) cache.delete(cache.keys().next().value);
    }
  }
};
