'use strict';
/**
 * QUEEN AKUMA — .eat (khana khao: coins kharch karo, XP pao).
 * Pehle ye sirf stub template tha, aur QUEEN AKUMA me koi health/hunger system
 * hai hi nahi (economy.js / rpg-*.js me health field nahi hai). Isliye .eat
 * ko existing systems se joda gaya: economy coins + XP system. Koi game
 * nahi — seedha khareedo-khao, fixed price, fixed XP.
 */
const economy = require('../lib/economy');
const xpLib = require('../lib/xpSystem');

const FOODS = {
  chai: { price: 20, xp: 5, emoji: '🍵', name: 'Chai' },
  samosa: { price: 50, xp: 10, emoji: '🥟', name: 'Samosa' },
  burger: { price: 150, xp: 20, emoji: '🍔', name: 'Burger' },
  pizza: { price: 200, xp: 25, emoji: '🍕', name: 'Pizza' },
  biryani: { price: 300, xp: 40, emoji: '🍛', name: 'Biryani' },
  thali: { price: 500, xp: 60, emoji: '🍱', name: 'Royal Thali' },
};

function fmt(n) { return Number(n || 0).toLocaleString('en-IN'); }

module.exports = {
  command: 'eat',
  aliases: [],
  category: 'game',
  description: 'Khana khao — coins se khareedo, XP pao.',
  usage: '.eat | .eat <food>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sender = message.key.participant || context.senderId;
    const { user } = economy.getUser(sender);
    const want = String((args || [])[0] || '').toLowerCase();
    if (!want) {
      const lines = Object.entries(FOODS).map(([k, f]) => f.emoji + ' *' + f.name + '* — ' + fmt(f.price) + ' coins ( +' + f.xp + ' XP)');
      await reply('🍽️ *QUEEN AKUMA CANTEEN*\n\n' + lines.join('\n') +
        '\n\n👛 Wallet: ' + fmt(user.coins) + ' coins\n\nKhane ke liye: *.eat <food>*\nExample: *.eat pizza*');
      return;
    }
    const food = FOODS[want];
    if (!food) {
      await reply('❌ Ye khana menu me nahi hai: *' + want + '*\nMenu dekhne ke liye *.eat* likho.');
      return;
    }
    if ((user.coins || 0) < food.price) {
      await reply('❌ Coins kam hain! *' + food.name + '* ke liye ' + fmt(food.price) + ' coins chahiye.\n👛 Wallet: ' + fmt(user.coins) + ' coins');
      return;
    }
    const before = (xpLib.progress(sender).xp || 0);
    economy.addCoins(sender, -food.price);
    xpLib.addXp(sender, food.xp);
    const after = (xpLib.progress(sender).xp || 0);
    const gained = after - before;
    const { user: u2 } = economy.getUser(sender);
    await reply(food.emoji + ' *' + food.name + ' kha liya!* Yummy 😋\n\n💰 -' + fmt(food.price) + ' coins  •  👛 Baki: ' + fmt(u2.coins) + ' coins\n⭐ +' + gained + ' XP' + (gained < food.xp ? ' _(XP cooldown — 60s me ek baar milta hai)_' : ''));
  }
};
