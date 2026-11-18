/**
 * QUEEN AKUMA v3.5.0 • #4 .automute / .autounmute / .getmute (raganork se — clean rewrite)
 * .automute 22 00 — roz raat 10 baje group mute (sirf admins bhej sakte hain)
 * .autounmute 06 00 — roz subah 6 baje unmute
 * .automute off / .autounmute off — band karo
 * .getmute — current schedule dekho
 * Check: lib/scheduler.js tick (har 30s) → lib/automute.checkDue(sock).
 */
const am = require('../lib/automute');

module.exports = {
  command: 'automute',
  aliases: ['autounmute', 'getmute'],
  category: 'group',
  description: 'Auto mute/unmute group at a set time every day',
  usage: '.automute 22 00 | .autounmute 06 00 | .getmute',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'automute').toLowerCase();
    const cfg = am.load();
    const c = cfg[chatId] || {};

    if (invoked === 'getmute') {
      const mute = c.muteH !== undefined ? `🔇 Mute: ${am.fmt(c.muteH, c.muteM)}` : '🔇 Mute: not set';
      const unmute = c.unmuteH !== undefined ? `🔊 Unmute: ${am.fmt(c.unmuteH, c.unmuteM)}` : '🔊 Unmute: not set';
      const state = c.muted ? ' (currently muted)' : '';
      return reply(`⏰ *Auto Mute Schedule*${state}\n\n${mute}\n${unmute}\n\n_Set: \`.automute 22 00\` / \`.autounmute 06 00\`_`);
    }

    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'off') {
      if (invoked === 'automute') { delete c.muteH; delete c.muteM; }
      else { delete c.unmuteH; delete c.unmuteM; }
      if (c.muteH === undefined && c.unmuteH === undefined) delete cfg[chatId];
      else cfg[chatId] = c;
      am.save(cfg);
      return reply(`✅ Auto-${invoked === 'automute' ? 'mute' : 'unmute'} band kar diya.`);
    }
    const hm = am.parseHM(args);
    if (!hm) {
      return reply(`❌ Wrong format!\n\n\`.${invoked} 22 00\` (10 PM ke liye)\n\`.${invoked} 06 00\` (6 AM ke liye)\n\`.${invoked} off\` (band karne ke liye)`);
    }
    if (invoked === 'automute') { c.muteH = hm.h; c.muteM = hm.m; }
    else { c.unmuteH = hm.h; c.unmuteM = hm.m; }
    cfg[chatId] = c;
    am.save(cfg);
    return reply(`✅ Auto-${invoked === 'automute' ? 'mute' : 'unmute'} set: roz *${am.fmt(hm.h, hm.m)}* baje.`);
  },
};
