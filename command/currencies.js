'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .currencies / .exchange (Iris port).
 * 7 currencies ek saath: coin + diamond/rubi/gold/stone/iron/wood.
 */
const economy = require('../lib/economy');
const currencies = require('../lib/currencies');

function fmt(n) { return Number(n || 0).toLocaleString('en-IN'); }

module.exports = {
  commands: [
    {
      command: 'currencies',
      aliases: ['currency', 'mycurrencies', 'wallet2'],
      description: 'Saari currencies ka balance dikhao.',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const sender = message.key.participant || context.senderId;
        const { user } = economy.getUser(sender);
        const cur = currencies.getUser(sender);
        const lines = ['💰 *Currencies*\n', '🪙 Coin: ' + fmt(user.coins)];
        for (const name of currencies.NAMES) {
          lines.push(currencies.EMOJI[name] + ' ' + name.charAt(0).toUpperCase() + name.slice(1) + ': ' + fmt(cur[name]) + '  (1 = ' + fmt(currencies.RATES[name]) + ' coins)');
        }
        lines.push('\nConvert karne ke liye: *.exchange <from> <to> <amount>*\nExample: .exchange diamond coin 2');
        await sock.sendMessage(chatId, { text: lines.join('\n') }, { quoted: message });
      }
    },
    {
      command: 'exchange',
      aliases: ['convert', 'swap'],
      description: 'Currency convert karo: .exchange diamond coin 2',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const sender = message.key.participant || context.senderId;
        const from = (args || [])[0], to = (args || [])[1];
        const amount = parseInt((args || [])[2], 10);
        if (!from || !to || !amount) {
          await reply('❌ Usage: *.exchange <from> <to> <amount>*\nCurrencies: coin, diamond, rubi, gold, stone, iron, wood\nExample: .exchange diamond coin 2');
          return;
        }
        const res = currencies.exchange(sender, from, to, amount);
        if (!res.ok) {
          await reply('❌ ' + res.error);
          return;
        }
        await reply('✅ *Exchange ho gaya!*\n\n' + res.amount + ' ' + res.from + ' → ' + fmt(res.got) + ' ' + res.to);
      }
    }
  ]
};
