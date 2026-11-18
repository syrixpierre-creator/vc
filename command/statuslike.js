/**
 * QUEEN AKUMA • .statuslike — status par auto-like (AURA ka command naam,
 * QUEEN AKUMA ke autostatus engine par). QUEEN AKUMA me ye kaam .autostatus react
 * karta hai; ye usi setting ko control karta hai.
 * .statuslike on|off | .statuslike ❤️🔥 | .statuslike emoji ❤️
 */
const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autoStatus.json');
const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);

async function readConfig() {
  try {
    if (HAS_DB) { const c = await store.getSetting('global', 'autoStatus'); if (c) return { enabled: !!c.enabled, reactOn: !!c.reactOn, emoji: c.emoji || '💚' }; }
    if (fs.existsSync(configPath)) { const c = JSON.parse(fs.readFileSync(configPath, 'utf8')); return { enabled: !!c.enabled, reactOn: !!c.reactOn, emoji: c.emoji || '💚' }; }
  } catch {}
  return { enabled: false, reactOn: false, emoji: '💚' };
}
async function writeConfig(cfg) {
  try {
    if (HAS_DB) { await store.saveSetting('global', 'autoStatus', cfg); return; }
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  } catch {}
}
function parseEmojis(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...seg.segment(text)].map((x) => x.segment.trim()).filter((x) => x && /\p{Extended_Pictographic}/u.test(x));
  }
  return [...text].filter((x) => /[\u{1F300}-\u{1FAFF}]/u.test(x));
}

module.exports = {
  command: 'statuslike',
  aliases: ['slike', 'statusreact'],
  category: 'owner',
  description: 'Auto-like WhatsApp statuses (owner only)',
  usage: '.statuslike on|off | .statuslike ❤️🔥 | .statuslike emoji ❤️',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const senderId = message.key.participant || message.key.remoteJid;
    let allowed = message.key.fromMe;
    if (!allowed) { try { allowed = await isOwnerOrSudo(senderId, sock, chatId); } catch {} }
    if (!allowed) return reply('🚫 *You are not authorized to use this command!* command.');
    const cfg = await readConfig();
    const action = String((args && args[0]) || '').toLowerCase();
    if (action === 'on' || action === 'off') {
      cfg.reactOn = action === 'on'; cfg.enabled = cfg.enabled || cfg.reactOn;
      await writeConfig(cfg);
      return reply(`💙 *Status Like:* ${cfg.reactOn ? 'ENABLED 🟢' : 'DISABLED 🔴'}`);
    }
    const rest = (args || []).slice(action === 'emoji' ? 1 : 0).join(' ').trim();
    const emojis = parseEmojis(rest);
    if (emojis.length) {
      cfg.emoji = emojis[0]; cfg.reactOn = true; cfg.enabled = true;
      await writeConfig(cfg);
      return reply(`💙 *Status Like activated!*\nEmoji: ${emojis.join(' ')} (ek status par ek reaction)`);
    }
    return reply(`💙 *Status Like Settings*\n\nStatus: ${cfg.reactOn ? 'ENABLED 🟢' : 'DISABLED 🔴'}\nEmoji: ${cfg.emoji}\n\n• .statuslike on/off\n• .statuslike ❤️💚🔥\n• .statuslike emoji ❤️`);
  }
};
