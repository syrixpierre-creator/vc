 'use strict';
/**
 * QUEEN AKUMA — .unbanuser : banned user ko unban karo.
 * Same store jo .ban / .unban use karte hain (command/ban.js helpers + data/banned.json).
 * Group me: bot admin + sender admin/owner. DM me: owner-only.
 * Usage: .unbanuser <@user | reply | number>
 */
const { getBannedUsers, saveBannedUsers } = require('./ban');
const digits = (s) => String(s || '').replace(/\D/g, '');

module.exports = {
  command: 'unbanuser',
  aliases: [],
  category: 'owner',
  description: 'Unban a user: .unbanuser <@user|reply|number>',
  usage: '.unbanuser <@user|reply|number>',
  // adminOnly: true zaroori hai — dispatcher tabhi isBotAdmin/isSenderAdmin
  // compute karta hai (lib/messageHandler.js: adminOnly branch). Bina iske
  // context.isBotAdmin hamesha false rehta hai.
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const { chatId, isGroup, senderIsOwnerOrSudo, isSenderAdmin, isBotAdmin, channelInfo } = context;
    const reply = (t) => sock.sendMessage(chatId, { text: t, ...(channelInfo || {}) }, { quoted: message });
    if (isGroup) {
      if (!isBotAdmin) { await reply('❌ *Please make the bot an admin first.*'); return; }
      if (!isSenderAdmin && !message.key.fromMe && !senderIsOwnerOrSudo) {
        await reply('🚫 *You are not authorized to use this command!*');
        return;
      }
    } else if (!message.key.fromMe && !senderIsOwnerOrSudo) {
      await reply('🚫 *You are not authorized to use this command!*');
      return;
    }
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    let target = null;
    if (ctxInfo.mentionedJid && ctxInfo.mentionedJid[0]) target = ctxInfo.mentionedJid[0];
    else if (ctxInfo.participant) target = ctxInfo.participant;
    else {
      const num = digits((args || [])[0] || '');
      if (num && num.length >= 10) target = num + '@s.whatsapp.net';
    }
    if (!target) {
      await reply('🚫 *Unban User*\n\nUsage: `.unbanuser @user`\nya reply karke / number deke bhejo.');
      return;
    }
    try {
      const banned = await getBannedUsers();
      let idx = banned.indexOf(target);
      if (idx === -1) {
        const d = digits(target);
        idx = banned.findIndex((b) => digits(b) === d || String(b).split('@')[0].endsWith(d.slice(-10)));
      }
      if (idx === -1) {
        await reply('ℹ️ @' + String(target).split('@')[0] + ' is not banned.');
        return;
      }
      const removed = banned[idx];
      banned.splice(idx, 1);
      await saveBannedUsers(banned);
      await sock.sendMessage(chatId, {
        text: '✅ *Unbanned*\n\n👤 @' + String(removed).split('@')[0] + ' has been unbanned.',
        mentions: [String(removed)],
        ...(channelInfo || {}),
      }, { quoted: message });
    } catch (e) {
      await reply('❌ *Unban failed:* ' + String(e.message || e).slice(0, 120));
    }
  },
};
