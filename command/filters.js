/**
 * QUEEN AKUMA — Advanced Filters (ported from Levanter)
 * Commands:
 *   .filter <keyword>   (reply to msg)  → group filter
 *   .filter list
 *   .stop <keyword>
 *   .gfilter <keyword>  (reply)         → global group filter
 *   .gfilter list
 *   .gstop <keyword>
 *   .pfilter <keyword>  (reply)         → personal/pm filter
 *   .pfilter list
 *   .pstop <keyword>
 */
const db = require('../lib/jsondb');
const settings = require('../settings');

const NAME = 'advanced_filters';

function load() {
  return db.load(NAME, {
    group: {},      // jid -> [{pattern, text}]
    gfilter: [],    // global for all groups
    pfilter: []     // personal (pm)
  });
}

function save(data) {
  db.save(NAME);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchFilter(text, pattern) {
  try {
    const re = new RegExp(`(?:^|\\W)${escapeRegExp(pattern)}(?:$|\\W)`, 'i');
    return re.test(text);
  } catch {
    return text.toLowerCase().includes(pattern.toLowerCase());
  }
}

module.exports = {
  command: 'filter',
  aliases: ['stop', 'gfilter', 'gstop', 'pfilter', 'pstop'],
  category: 'group',
  description: 'Advanced auto-reply filters (group / global / personal) - Levanter style',
  usage: '.filter keyword (reply) | .filter list | .stop keyword | .gfilter | .pfilter',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = context.senderId || message.key.participant || chatId;
    const isGroup = chatId.endsWith('@g.us');
    const body = (message.body || message.message?.conversation || message.message?.extendedTextMessage?.text || '').trim();
    const cmd = body.split(/\s+/)[0].replace(/^[.!#]/, '').toLowerCase();
    const match = args.join(' ').trim();
    const data = load();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    // Get quoted text if any
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || quoted?.imageMessage?.caption || quoted?.videoMessage?.caption || '';

    // ========== GROUP FILTER (.filter / .stop) ==========
    if (cmd === 'filter' || cmd === 'stop') {
      if (!isGroup) return reply('❌ *This command can only be used in groups!*');

      if (cmd === 'stop') {
        if (!match) return reply('❌ Usage: `.stop <keyword>`');
        if (!data.group[chatId]) data.group[chatId] = [];
        const before = data.group[chatId].length;
        data.group[chatId] = data.group[chatId].filter(f => f.pattern.toLowerCase() !== match.toLowerCase());
        save(data);
        return reply(data.group[chatId].length < before
          ? `✅ *Filter ${match} deleted.*`
          : `❌ *Filter ${match} not found.*`);
      }

      // filter list
      if (match.toLowerCase() === 'list') {
        const list = data.group[chatId] || [];
        if (!list.length) return reply('📭 *No filters in this group.*\n📌 *Usage:* reply to a message with .filter <keyword>');
        let msg = `📋 *Group Filters* (${list.length})\n\n`;
        list.forEach((f, i) => msg += `${i + 1}. *${f.pattern}*\n`);
        return reply(msg);
      }

      if (!match) {
        return reply(
`🔧 *Advanced Filters (Levanter style)*

*Group (current):*
• Reply to message + \`.filter keyword\`
• \`.filter list\`
• \`.stop keyword\`

*Global (all groups):*
• \`.gfilter keyword\` (reply)
• \`.gfilter list\`
• \`.gstop keyword\`

*Personal (PM only):*
• \`.pfilter keyword\` (reply)
• \`.pfilter list\`
• \`.pstop keyword\``
        );
      }

      if (!quotedText) return reply('📌 *Usage:* reply to a message with .filter <keyword>');

      if (!data.group[chatId]) data.group[chatId] = [];
      // replace if exists
      data.group[chatId] = data.group[chatId].filter(f => f.pattern.toLowerCase() !== match.toLowerCase());
      data.group[chatId].push({ pattern: match, text: quotedText });
      save(data);
      return reply(`✅ *Filter added:* ${match}`);
    }

    // ========== GLOBAL GROUP FILTER (.gfilter / .gstop) ==========
    if (cmd === 'gfilter' || cmd === 'gstop') {
      if (cmd === 'gstop') {
        if (!match) return reply('❌ Usage: `.gstop <keyword>`');
        const before = data.gfilter.length;
        data.gfilter = data.gfilter.filter(f => f.pattern.toLowerCase() !== match.toLowerCase());
        save(data);
        return reply(data.gfilter.length < before
          ? `✅ Global filter *${match}* delete.`
          : `❌ *Global filter ${match} not found.*`);
      }

      if (match.toLowerCase() === 'list') {
        if (!data.gfilter.length) return reply('📭 *No global filters.*');
        let msg = `🌐 *Global Group Filters* (${data.gfilter.length})\n\n`;
        data.gfilter.forEach((f, i) => msg += `${i + 1}. *${f.pattern}*\n`);
        return reply(msg);
      }

      if (!match) return reply('❌ Usage: reply + `.gfilter keyword`  or  `.gfilter list`');
      if (!quotedText) return reply('❌ Reply to a message first.');

      data.gfilter = data.gfilter.filter(f => f.pattern.toLowerCase() !== match.toLowerCase());
      data.gfilter.push({ pattern: match, text: quotedText });
      save(data);
      return reply(`✅ Global filter add!\nKeyword: *${match}*`);
    }

    // ========== PERSONAL FILTER (.pfilter / .pstop) ==========
    if (cmd === 'pfilter' || cmd === 'pstop') {
      if (cmd === 'pstop') {
        if (!match) return reply('❌ Usage: `.pstop <keyword>`');
        const before = data.pfilter.length;
        data.pfilter = data.pfilter.filter(f => f.pattern.toLowerCase() !== match.toLowerCase());
        save(data);
        return reply(data.pfilter.length < before
          ? `✅ Personal filter *${match}* delete.`
          : `❌ *Personal filter ${match} not found.*`);
      }

      if (match.toLowerCase() === 'list') {
        if (!data.pfilter.length) return reply('📭 *No personal filters.*');
        let msg = `👤 *Personal Filters* (${data.pfilter.length})\n\n`;
        data.pfilter.forEach((f, i) => msg += `${i + 1}. *${f.pattern}*\n`);
        return reply(msg);
      }

      if (!match) return reply('❌ Usage: reply + `.pfilter keyword`  or  `.pfilter list`');
      if (!quotedText) return reply('❌ Reply to a message first.');

      data.pfilter = data.pfilter.filter(f => f.pattern.toLowerCase() !== match.toLowerCase());
      data.pfilter.push({ pattern: match, text: quotedText });
      save(data);
      return reply(`✅ Personal filter add!\nKeyword: *${match}*`);
    }
  },

  // Message listener for auto replies
  async onMessage(sock, message, ctx) {
    try {
      if (message.key.fromMe) return;
      const text = (ctx.messageText || '').trim();
      if (!text) return;
      // skip if starts with prefix
      if (settings.prefixes?.some(p => text.startsWith(p))) return;

      const chatId = ctx.chatId;
      const isGroup = chatId.endsWith('@g.us');
      const data = load();

      // 1. Group specific filters
      if (isGroup && data.group[chatId]) {
        for (const f of data.group[chatId]) {
          if (matchFilter(text, f.pattern)) {
            await sock.sendMessage(chatId, { text: f.text }, { quoted: message });
            return;
          }
        }
      }

      // 2. Global group filters
      if (isGroup && data.gfilter.length) {
        for (const f of data.gfilter) {
          if (matchFilter(text, f.pattern)) {
            await sock.sendMessage(chatId, { text: f.text }, { quoted: message });
            return;
          }
        }
      }

      // 3. Personal filters (PM only)
      if (!isGroup && data.pfilter.length) {
        for (const f of data.pfilter) {
          if (matchFilter(text, f.pattern)) {
            await sock.sendMessage(chatId, { text: f.text }, { quoted: message });
            return;
          }
        }
      }
    } catch (e) {
      console.error('[filters onMessage]', e.message);
    }
  }
};
