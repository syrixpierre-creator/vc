/**
 * QUEEN AKUMA v3.5.0 • GAAJU .presence — typing/recording indicator per scope
 * .presence — status dekho
 * .presence typing [all|group|dm] — typing indicator
 * .presence recording [all|group|dm] — recording indicator
 * .presence off — sab band
 * Store: data/presence.json. Enforcement: command/autotyping.js
 * handleAutotypingForMessage (presence mode autotyping toggle ko override karta hai).
 * Owner-only.
 */
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'presence.json');
function load() { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch (_) { return { mode: 'off', scope: 'all' }; } }
function save(d) { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(d, null, 2)); } catch (_) {} }

module.exports = {
  command: 'presence',
  aliases: ['indicator', 'botpresence'],
  category: 'owner',
  description: 'Typing/recording indicator per scope (all/group/dm)',
  usage: '.presence | .presence typing [all|group|dm] | .presence recording [all|group|dm] | .presence off',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!context.isOwnerOrSudoCheck) return reply('🚫 *You are not authorized to use this command!*');
    const mode = String(args[0] || '').toLowerCase();
    const scopeArg = String(args[1] || 'all').toLowerCase();
    const scope = ['all', 'group', 'dm'].includes(scopeArg) ? scopeArg : 'all';
    const scopeLabel = scope === 'all' ? 'all chats' : scope === 'group' ? 'groups only' : 'DMs only';
    if (!mode || mode === 'status') {
      const cur = load();
      const active = cur.mode !== 'off' ? (cur.mode === 'typing' ? '⌨️ Typing' : '🎙️ Recording') : '❌ None';
      return reply(`✅ *Current presence: ${cur.mode || 'off'}*\n\nAvailable options:\n- typing\n- recording\n- off`);
    }
    if (mode === 'off') {
      save({ mode: 'off', scope: 'all' });
      return reply('✅ *Your presence updated to: off*');
    }
    if (mode === 'typing' || mode === 'recording') {
      save({ mode, scope });
      return reply(`✅ *Your presence updated to: ${mode}*`);
    }
    return reply('❌ *Invalid option!*\n\nAvailable options:\n- typing\n- recording\n- off');
  },
};
