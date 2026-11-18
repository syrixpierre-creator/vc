'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .bank REAL (OVL bank-capacity + timed bonus).
 * Pehle ye sirf stub tha. Ab: wallet + bank balance, capacity (level se
 * badhti hai), deposit/withdraw, har 6 ghante timed bonus.
 * Bank data lib/economy.js user object me (bank, lastBonus).
 * Capacity = 10000 + level * 5000.
 */
const economy = require('../lib/economy');
const xpLib = require('../lib/xpSystem');
const currencies = require('../lib/currencies');

const BONUS_COOLDOWN = 6 * 3600000; // 6 ghante
function capacityFor(level) { return 10000 + (level || 0) * 5000; }
function fmt(n) { return Number(n || 0).toLocaleString('en-IN'); }

module.exports = {
  command: 'bank',
  aliases: ['mybank', 'vault'],
  category: 'economy',
  description: 'Bank balance, deposit/withdraw, timed bonus.',
  usage: '.bank | .bank deposit <n> | .bank withdraw <n> | .bank bonus',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sender = message.key.participant || context.senderId;
    const { user } = economy.getUser(sender);
    if (user.bank == null) user.bank = 0;
    if (user.lastBonus == null) user.lastBonus = 0;
    const level = (xpLib.progress(sender).level || 0);
    const cap = capacityFor(level);
    const sub = String((args || [])[0] || '').toLowerCase();
    const n = parseInt((args || [])[1], 10);

    const show = () => {
      const cur = currencies.getUser(sender);
      const curLine = Object.entries(cur).filter(([, v]) => v > 0).map(([k, v]) => k + ': ' + fmt(v)).join(' • ') || 'koi currency nahi';
      return '🏦 *Bank*\n\n' +
        '👛 Wallet: ' + fmt(user.coins) + ' coins\n' +
        '🏦 Bank: ' + fmt(user.bank) + ' / ' + fmt(cap) + ' coins\n' +
        '📈 Level: ' + level + ' (capacity level se badhti hai)\n' +
        '💎 Currencies: ' + curLine + '\n\n' +
        'Commands: *.bank deposit <n>* • *.bank withdraw <n>* • *.bank bonus* (har 6 ghante)';
    };

    if (!sub) { await reply(show()); return; }
    if (sub === 'deposit' || sub === 'dep') {
      if (!n || n <= 0) { await reply('❌ Amount do. Example: *.bank deposit 500*'); return; }
      if ((user.coins || 0) < n) { await reply('❌ Wallet me itne coins nahi hain. Wallet: ' + fmt(user.coins)); return; }
      if ((user.bank || 0) + n > cap) {
        await reply('❌ Bank capacity full ho jayegi! Capacity: ' + fmt(cap) + ', bank me hai: ' + fmt(user.bank) + '. Max deposit: ' + fmt(cap - (user.bank || 0)) + '.\nLevel badhao (.level) — capacity badhegi.');
        return;
      }
      economy.addCoins(sender, -n);
      const newBank = economy.setBank(sender, (user.bank || 0) + n, null);
      await reply('✅ *' + fmt(n) + ' coins* bank me deposit ho gaye.\n🏦 Bank: ' + fmt(newBank) + ' / ' + fmt(cap));
      return;
    }
    if (sub === 'withdraw' || sub === 'wd') {
      if (!n || n <= 0) { await reply('❌ Amount do. Example: *.bank withdraw 500*'); return; }
      if ((user.bank || 0) < n) { await reply('❌ Bank me itne coins nahi hain. Bank: ' + fmt(user.bank)); return; }
      const newBank = economy.setBank(sender, (user.bank || 0) - n, null);
      const wallet = economy.addCoins(sender, n);
      await reply('✅ *' + fmt(n) + ' coins* bank se nikal liye.\n👛 Wallet: ' + fmt(wallet) + '  •  🏦 Bank: ' + fmt(newBank));
      return;
    }
    if (sub === 'bonus') {
      const now = Date.now();
      const left = BONUS_COOLDOWN - (now - (user.lastBonus || 0));
      if (left > 0) {
        const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000);
        await reply('⏳ Bonus abhi ready nahi hai. Agla bonus: ' + h + 'h ' + m + 'm baad.');
        return;
      }
      const bonus = 100 + level * 20;
      const space = cap - (user.bank || 0);
      const got = Math.min(bonus, Math.max(0, space));
      if (got <= 0) { await reply('❌ Bank full hai — bonus lene ke liye pehle withdraw karo.'); return; }
      const newBank = economy.setBank(sender, (user.bank || 0) + got, now);
      await reply('🎁 *Timed Bonus!* +' + fmt(got) + ' coins bank me aaye.\n🏦 Bank: ' + fmt(newBank) + ' / ' + fmt(cap) + '\n⏰ Agla bonus 6 ghante baad.');
      return;
    }
    await reply(show());
  }
};
