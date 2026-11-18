/** DM greeting: greets each new private-chat user once. Owner config via .greet */
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.cwd(), 'data');
const CFG = path.join(DIR, 'greetdm.json');
const SEEN = path.join(DIR, 'greetedUsers.json');
const DEFAULT = { enabled: false, message: 'Hello @user! Thanks for messaging me. 👋' };
function rj(p, d) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return d; } }
function wj(p, v) { try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2)); } catch (_) {} }
const cfg = () => ({ ...DEFAULT, ...rj(CFG, {}) });

module.exports = {
  command: 'greet',
  aliases: ['greetdm', 'greetprivate', 'dmwelcome'],
  category: 'owner',
  description: 'Auto-greet people who message the bot in private (once per user)',
  usage: '.greet on|off|set <msg>|list|reset   (use @user in the message)',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sub = (args[0] || '').toLowerCase();
    const c = cfg();
    if (sub === 'on') { c.enabled = true; wj(CFG, c); return reply('✅ DM greeting *ON*\n\n' + c.message); }
    if (sub === 'off') { c.enabled = false; wj(CFG, c); return reply('❌ DM greeting *OFF*'); }
    if (sub === 'set') {
      const msg = args.slice(1).join(' ').trim();
      if (!msg) return reply('Usage: `.greet set Hello @user, welcome!`');
      c.message = msg; wj(CFG, c); return reply('✅ Greeting message saved:\n\n' + msg);
    }
    if (sub === 'list') return reply(`👥 Greeted users: ${rj(SEEN, []).length}`);
    if (sub === 'reset') { wj(SEEN, []); return reply('🔄 Greeted-users list cleared. Everyone will be greeted again.'); }
    return reply(`💬 *DM Greeting*\nStatus: ${c.enabled ? '✅ ON' : '❌ OFF'}\nMessage: ${c.message}\nGreeted: ${rj(SEEN, []).length}\n\nUsage: .greet on|off|set <msg>|list|reset`);
  },
  async onMessage(sock, message) {
    try {
      const jid = message.key?.remoteJid || '';
      if (message.key.fromMe || jid.endsWith('@g.us') || jid === 'status@broadcast' || jid.endsWith('@newsletter') || jid.endsWith('@broadcast')) return;
      const c = cfg();
      if (!c.enabled) return;
      const seen = new Set(rj(SEEN, []));
      if (seen.has(jid)) return;
      seen.add(jid); wj(SEEN, [...seen]);
      const num = jid.split('@')[0];
      await sock.sendMessage(jid, { text: c.message.replace(/@user/g, '@' + num), mentions: [jid] });
    } catch (e) { console.error('[greet]', e.message); }
  }
};
