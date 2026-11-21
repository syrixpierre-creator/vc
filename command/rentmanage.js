'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Clone rent manager commands (owner-only, DM se bhi chalte hain).
 * .rentlist    — kisko-kisko bot rent par diya hai (poori list + counts)
 * .rentadd     — rent par do: .rentadd <number> <30d> [price] [naam]
 * .rentremove  — rent hatao + clone stop: .rentremove <number|index>
 * .rentinfo    — ek renter ki poori detail
 * .rentextend  — time badhao: .rentextend <number|index> <7d>
 * .rentexpiring — jald expire hone wale (default 7 din)
 * .rentexpired — purana hisaab (expired / removed / stopped)
 * .rentstats   — total: active, online, expiring, kamai
 */
const rentLib = require('../lib/cloneRent');

function isOwner(context) {
  return !!(context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo);
}
function ownerOnlyReply(reply) {
  return reply('🚫 *You are not authorized to use this command!*');
}
function statusBadge(e) {
  if (e.online) return '🟢 ONLINE';
  if (e.rent) return '⚪ OFFLINE (rent active)';
  if (e.authId) return '⚪ OFFLINE (stored)';
  return '⚪ OFFLINE';
}
function rentLine(e, i) {
  const r = e.rent;
  const left = r && r.expiresAt ? r.expiresAt - Date.now() : null;
  let s = (i + 1) + '. @' + e.number;
  if (e.name) s += ' (' + e.name + ')';
  s += '\n   ' + statusBadge(e);
  if (r) {
    s += '\n   💰 Price: ' + rentLib.fmtPrice(r.price);
    s += '\n   📅 Expires: ' + rentLib.fmtDateIST(r.expiresAt) + (r.expiresAt ? ' (' + rentLib.fmtRemaining(left) + ')' : ' — unlimited');
  } else {
    s += '\n   💰 No rent record';
  }
  return s;
}

module.exports = {
  commands: [
    {
      command: 'rentlist',
      aliases: ['renters', 'myrenters'],
      description: 'List of all rented bots (owner only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t, extra) => sock.sendMessage(chatId, Object.assign({ text: t }, extra || {}), { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        const list = rentLib.listAllClones();
        if (!list.length) {
          await reply('❌ *No rented bots yet.*\n📌 *Usage:* .rentadd <number> <30d> [price] [name]');
          return;
        }
        const active = list.filter((e) => e.rent);
        const noRecord = list.filter((e) => !e.rent);
        const online = list.filter((e) => e.online).length;
        const expiring = active.filter((e) => e.rent.expiresAt && e.rent.expiresAt - Date.now() > 0 && e.rent.expiresAt - Date.now() <= 7 * 86400000).length;
        let msg = '📋 *RENTED BOTS* (' + list.length + ')\n\n';
        msg += '🟢 Online: ' + online + '  •  ⏰ 7 din me expire: ' + expiring + '\n\n';
        msg += list.map((e, i) => rentLine(e, i)).join('\n\n');
        if (noRecord.length) {
          msg += '\n\n⚠️ *Bina rent record ke ' + noRecord.length + ' clones* without rent record.';
        }
        msg += '\n\nCommands: .rentadd / .rentremove / .rentinfo / .rentextend / .rentexpiring / .rentexpired / .rentstats';
        const mentions = list.map((e) => e.number + '@s.whatsapp.net');
        await reply(msg, { mentions: mentions });
      }
    },
    {
      command: 'rentadd',
      aliases: [],
      description: 'Rent par do: .rentadd <number> <30d> [price] [naam] (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        const num = rentLib.normNumber((args || [])[0]);
        const durStr = (args || [])[1];
        if (!num || num.length < 10 || !durStr) {
          await reply('📌 *Usage:* .rentadd <number> <duration> [price] [name]');
          return;
        }
        const ms = rentLib.parseDuration(durStr);
        if (!ms) { await reply('❌ Duration galat hai. Example: *30d*, *7d*, *24h*.'); return; }
        const rest = (args || []).slice(2);
        let price = null;
        let name = '';
        if (rest.length && /^\d+(\.\d+)?$/.test(rest[0])) { price = rest[0]; name = rest.slice(1).join(' '); }
        else { name = rest.join(' '); }
        const existing = rentLib.getRecord(num);
        if (existing) {
          await reply('ℹ️ @' + num + ' already has an active rent (expires: ' + rentLib.fmtDateIST(existing.expiresAt) + ').\nTo add time use .rentextend ' + num + ' ' + durStr + '* or first .rentremove ' + num + '* karo.', { mentions: [num + '@s.whatsapp.net'] });
          return;
        }
        const rec = rentLib.setRent(num, { durationMs: ms, price: price, renterName: name, source: 'rentadd' });
        await reply('✅ *Rent added!*\n\n👤 Renter: @' + num + (name ? ' (' + name + ')' : '') + '\n💰 Price: ' + rentLib.fmtPrice(price) + '\n📅 Started: ' + rentLib.fmtDateIST(rec.startedAt) + '\n⏰ Expires: ' + rentLib.fmtDateIST(rec.expiresAt) + ' (' + rentLib.fmtRemaining(ms) + ')\n\nThe clone stops when the time ends. List: .rentlist', { mentions: [num + '@s.whatsapp.net'] });
      }
    },
    {
      command: 'rentremove',
      aliases: ['removerent'],
      description: 'Remove a rent and stop the clone (owner only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t, extra) => sock.sendMessage(chatId, Object.assign({ text: t }, extra || {}), { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        const input = (args || [])[0];
        if (!input) { await reply('📌 *Usage:* .rentremove <number or list index>'); return; }
        const list = rentLib.listAllClones();
        const target = rentLib.resolveTarget(input, list);
        if (!target) { await reply('❌ *Not found in the list.* See .rentlist'); return; }
        // Online clone hai to stop karo.
        let stopped = false;
        try {
          const conn = target.conn || (global.conns || []).find((c) => rentLib.matchNumber(rentLib.normNumber(String(((c && c.user) || {}).id || '').split(':')[0]), target.number));
          if (conn) {
            try { await conn.logout(); } catch (e) {}
            try { conn.end(); } catch (e) {}
            const i = (global.conns || []).indexOf(conn);
            if (i > -1) global.conns.splice(i, 1);
            stopped = true;
          }
        } catch (e) {}
        // Session folder hatao (logout ke baad creds bekaar hain).
        try {
          const fs = require('fs');
          const path = require('path');
          const dir = target.authId ? path.join(process.cwd(), 'session', 'clones', target.authId) : '';
          if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
        } catch (e) {}
        const rec = rentLib.removeRent(target.number);
        await reply('✅ *Rent removed*\n\n👤 @' + target.number + (target.name ? ' (' + target.name + ')' : '') + '\n🔌 Clone: ' + (stopped ? 'stopped' : 'already offline') + '\n📜 Saved in history: .rentexpired', { mentions: [target.number + '@s.whatsapp.net'] });
        return rec;
      }
    },
    {
      command: 'rentinfo',
      aliases: ['rentdetail'],
      description: 'Show the full detail of a renter (owner only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t, extra) => sock.sendMessage(chatId, Object.assign({ text: t }, extra || {}), { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        const input = (args || [])[0];
        if (!input) { await reply('❌ Usage: *.rentinfo <number ya list number>*'); return; }
        const list = rentLib.listAllClones();
        const target = rentLib.resolveTarget(input, list);
        if (!target) { await reply('❌ *Not found in the list.* See .rentlist'); return; }
        const r = target.rent || rentLib.getRecord(target.number);
        let msg = '👤 *RENT DETAIL*\n\nNumber: @' + target.number + '\n';
        if (target.name) msg += 'Naam: ' + target.name + '\n';
        msg += 'Status: ' + (target.online ? '🟢 ONLINE' : '⚪ OFFLINE') + '\n';
        if (r) {
          msg += '💰 Price: ' + rentLib.fmtPrice(r.price) + '\n';
          msg += '📅 Started: ' + rentLib.fmtDateIST(r.startedAt) + '\n';
          msg += '⏰ Expires: ' + rentLib.fmtDateIST(r.expiresAt) + '\n';
          msg += '⏳ Remaining: ' + rentLib.fmtRemaining(r.expiresAt ? r.expiresAt - Date.now() : null) + '\n';
          if (r.notes) msg += '📝 Notes: ' + r.notes + '\n';
        } else {
          msg += '\n⚠️ No rent record.\nAdd: .rentadd ' + target.number + ' 30d [price] [naam]*';
        }
        await reply(msg, { mentions: [target.number + '@s.whatsapp.net'] });
      }
    },
    {
      command: 'rentextend',
      aliases: ['rentrenew'],
      description: 'Rent ka time badhao: .rentextend <number|index> <7d> (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t, extra) => sock.sendMessage(chatId, Object.assign({ text: t }, extra || {}), { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        const input = (args || [])[0];
        const durStr = (args || [])[1];
        if (!input || !durStr) { await reply('❌ Usage: *.rentextend <number ya list number> <duration>*\nExample: *.rentextend 919876543210 7d*'); return; }
        const ms = rentLib.parseDuration(durStr);
        if (!ms) { await reply('❌ Duration galat hai. Example: *7d*, *30d*, *24h*.'); return; }
        const list = rentLib.listAllClones();
        const target = rentLib.resolveTarget(input, list);
        if (!target || !rentLib.getRecord(target.number)) { await reply('❌ *No active rent on this number.*'); return; }
        const rec = rentLib.extendRent(target.number, ms);
        await reply('✅ *Rent extended!*\n\n👤 @' + target.number + (target.name ? ' (' + target.name + ')' : '') + '\n⏰ Nayi expiry: ' + rentLib.fmtDateIST(rec.expiresAt) + ' (' + rentLib.fmtRemaining(rec.expiresAt - Date.now()) + ' bacha hai)', { mentions: [target.number + '@s.whatsapp.net'] });
      }
    },
    {
      command: 'rentexpiring',
      aliases: [],
      description: 'Jald expire hone wale renters (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t, extra) => sock.sendMessage(chatId, Object.assign({ text: t }, extra || {}), { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        let days = parseInt(((args || [])[0] || '7'), 10);
        if (isNaN(days) || days < 1) days = 7;
        const now = Date.now();
        const list = rentLib.listRecords()
          .filter((r) => r.expiresAt && r.expiresAt > now && r.expiresAt - now <= days * 86400000)
          .sort((a, b) => a.expiresAt - b.expiresAt);
        if (!list.length) { await reply('✅ Agle ' + days + ' days: no rent expiring.'); return; }
        let msg = '⏰ *EXPIRING IN ' + days + ' DAYS* (' + list.length + ')\n\n';
        msg += list.map((r, i) => (i + 1) + '. @' + r.number + (r.renterName ? ' (' + r.renterName + ')' : '') + '\n   Expires: ' + rentLib.fmtDateIST(r.expiresAt) + ' (' + rentLib.fmtRemaining(r.expiresAt - now) + ')\n   Price: ' + rentLib.fmtPrice(r.price)).join('\n\n');
        const mentions = list.map((r) => r.number + '@s.whatsapp.net');
        await reply(msg, { mentions: mentions });
      }
    },
    {
      command: 'rentexpired',
      aliases: [],
      description: 'Purana hisaab — expired / removed renters (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t, extra) => sock.sendMessage(chatId, Object.assign({ text: t }, extra || {}), { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        const hist = rentLib.listHistory().slice(0, 20);
        if (!hist.length) { await reply('❌ *No expired or removed rents yet.*'); return; }
        let msg = '📜 *RENT HISTORY* (' + rentLib.listHistory().length + ')\n\n';
        msg += hist.map((r, i) => (i + 1) + '. @' + r.number + (r.renterName ? ' (' + r.renterName + ')' : '') + '\n   Status: ' + (r.status || 'closed') + '\n   Closed: ' + rentLib.fmtDateIST(r.closedAt) + '\n   Price: ' + rentLib.fmtPrice(r.price)).join('\n\n');
        const mentions = hist.map((r) => r.number + '@s.whatsapp.net');
        await reply(msg, { mentions: mentions });
      }
    },
    {
      command: 'rentstats',
      aliases: [],
      description: 'Rent ka total hisaab (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
        if (!isOwner(context)) { await ownerOnlyReply(reply); return; }
        const list = rentLib.listAllClones();
        const records = rentLib.listRecords();
        const hist = rentLib.listHistory();
        const now = Date.now();
        const online = list.filter((e) => e.online).length;
        const expiring = records.filter((r) => r.expiresAt && r.expiresAt > now && r.expiresAt - now <= 7 * 86400000).length;
        const expiredCount = hist.filter((r) => r.status === 'expired').length;
        const sumPrice = (arr) => arr.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
        const activeTotal = sumPrice(records);
        const histTotal = sumPrice(hist);
        let msg = '📊 *RENT STATS*\n\n';
        msg += '👥 Total rented bots: ' + list.length + '\n';
        msg += '🟢 Online abhi: ' + online + '\n';
        msg += '✅ Active rent: ' + records.length + '\n';
        msg += '⏰ 7 din me expire: ' + expiring + '\n';
        msg += '📜 History (expired/removed): ' + hist.length + ' (expired: ' + expiredCount + ')\n';
        msg += '⚠️ Bina record ke clones: ' + list.filter((e) => !e.rent).length + '\n\n';
        msg += '💰 Active rent total: ₹' + activeTotal + '\n';
        msg += '💰 History total: ₹' + histTotal + '\n';
        msg += '💰 Grand total: ₹' + (activeTotal + histTotal) + '\n\n';
        msg += 'List: .rentlist';
        await reply(msg);
      }
    }
  ]
};
