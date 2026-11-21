'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Rent system commands (RyzumiMD port).
 * .setexpired — group rent set karo (owner-only).
 * .cekexpired — group ki expiry dekho.
 * .listexpired — saare rented groups dekho (owner-only).
 */
const rentLib = require('../lib/rent');

module.exports = {
  commands: [
    {
      command: 'setexpired',
      aliases: ['setrent', 'addrent'],
      description: 'Group rent set karo: .setexpired 30d (owner-only).',
      category: 'owner',
      groupOnly: true,
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const durStr = (args || [])[0];
        const ms = rentLib.parseDuration(durStr);
        if (!ms) {
          await reply('❌ Duration is format me do: *.setexpired 30d*\nFormats: 30d (days), 24h (hours), 60m (minutes). Example: .setexpired 7d');
          return;
        }
        let name = '';
        try { const meta = await sock.groupMetadata(chatId); name = meta.subject || ''; } catch (e) {}
        const r = rentLib.setRent(chatId, ms, context.senderId, name);
        await reply('✅ *Rent set!*\n\n👥 Group: ' + (name || chatId) + '\n⏰ Expires: ' + new Date(r.expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '\n⏳ Remaining: ' + rentLib.fmtRemaining(ms) + '\n\nTime khatam hote hi bot group se auto-leave kar dega.');
      }
    },
    {
      command: 'cekexpired',
      aliases: ['checkexpired', 'rentstatus'],
      description: 'Show the rent expiry of the group.',
      category: 'group',
      groupOnly: true,
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const r = rentLib.getRent(chatId);
        if (!r) {
          await reply('❌ *No rent set on this group (unlimited).*');
          return;
        }
        const left = r.expiresAt - Date.now();
        await reply('⏰ *Rent Status*\n\nExpires: ' + new Date(r.expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '\nRemaining: ' + (left > 0 ? rentLib.fmtRemaining(left) : 'EXPIRED — bot jald leave karega'));
      }
    },
    {
      command: 'listexpired',
      aliases: ['listrent', 'rents'],
      description: 'Show all rented groups (owner only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const all = rentLib.listRent();
        const entries = Object.entries(all);
        if (!entries.length) {
          await reply('❌ *No rented groups.*');
          return;
        }
        const lines = entries.map(([jid, r], i) => {
          const left = r.expiresAt - Date.now();
          return (i + 1) + '. ' + (r.groupName || jid) + '\n   Remaining: ' + (left > 0 ? rentLib.fmtRemaining(left) : 'EXPIRED');
        });
        await reply('⏰ *Rented Groups* (' + entries.length + ')\n\n' + lines.join('\n'));
      }
    }
  ]
};
