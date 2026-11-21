/**
 * QUEEN AKUMA v3.0.0 — Economy commands
 * .daily | .balance | .bazaar | .buyitem | .sendcoins | .richlist | .gamble | .kaam | .rob
 */
const eco = require('../lib/economy');

function num(jid) { return String(jid || '').split('@')[0]; }
function targetJid(message, args) {
  const ctx = message.message?.extendedTextMessage?.contextInfo;
  if (ctx?.mentionedJid?.length) return ctx.mentionedJid[0];
  if (ctx?.participant) return ctx.participant;
  const raw = (args[0] || '').replace(/[^0-9]/g, '');
  if (raw.length >= 10) return raw + '@s.whatsapp.net';
  return null;
}

module.exports = { commands: [
  {
    command: 'daily', aliases: [], category: 'economy',
    description: 'Roz 100 coins claim karo',
    usage: '.daily',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const r = eco.daily(sender);
      if (!r.ok) return reply(`⏳ *Daily reward not ready.* Next claim in *${r.wait}*.`);
      return reply(`🎁 *Daily Reward!*\n\n+${r.got} coins mile!\n💰 Balance: *${r.coins} coins*\n\nKal phir aana! 😄`);
    }
  },
  {
    command: 'balance', aliases: ['coins'], category: 'economy',
    description: 'Show your coins and items',
    usage: '.balance',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const { user } = eco.getUser(sender);
      const items = (user.items || []).map((id) => {
        const s = eco.SHOP.find((x) => x.id === id);
        return s ? `${s.emoji} ${s.name}` : id;
      });
      const badge = (user.items || []).includes('vip') ? ' 👑 VIP' : ((user.items || []).includes('crown') ? ' 🤴 KING' : '');
      return reply(`💰 *Wallet*${badge}\n\n🪙 Coins: *${user.coins || 0}*\n🎒 Items: ${items.length ? items.join(', ') : 'none'}\n🏆 Wins: ${user.wins || 0} | Losses: ${user.losses || 0}\n\n`.daily` — roz 100 coins\n`.kaam` — kaam karke coins kamao`);
    }
  },
  {
    command: 'bazaar', aliases: [], category: 'economy',
    description: 'Shop — coins se items kharido',
    usage: '.bazaar',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const bal = eco.balance(sender);
      const list = eco.SHOP.map((s) => `${s.emoji} *${s.name}* — ${s.price} coins\n   _${s.desc}_`).join('\n\n');
      return reply(`🛒 *Bazaar*\n\n💰 Your coins: *${bal}*\n\n${list}\n\n📌 *Usage:* .buyitem <name>`);
    }
  },
  {
    command: 'buyitem', aliases: [], category: 'economy',
    description: 'Bazaar se item kharido',
    usage: '.buyitem <name>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const id = (args[0] || '').toLowerCase();
      if (!id) return reply('📌 *Usage:* .buyitem <name>');
      const r = eco.buy(sender, id);
      if (!r.ok) return reply('❌ ' + r.error);
      return reply(`✅ *Kharid liya!* ${r.item.emoji} *${r.item.name}*\n\n💰 Bache hue coins: *${r.coins}*\n_${r.item.desc}_`);
    }
  },
  {
    command: 'sendcoins', aliases: [], category: 'economy',
    description: 'Send coins to another user',
    usage: '.sendcoins @user <amount>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const to = targetJid(message, args);
      const amount = parseInt(args[args.length - 1], 10);
      if (!to) return reply('📌 *Usage:* .sendcoins @user 50');
      if (num(to) === num(sender)) return reply('❌ *You cannot send coins to yourself!*');
      const r = eco.transfer(sender, to, amount);
      if (!r.ok) return reply('❌ ' + r.error);
      return reply(`💸 *Coins bhej diye!*\n\n${amount} coins → @${num(to)}\n💰 Tumhara balance: *${r.from}*`);
    }
  },
  {
    command: 'richlist', aliases: [], category: 'economy',
    description: 'Sabse amir users — leaderboard',
    usage: '.richlist',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const top = eco.leaderboard(10);
      if (!top.length) return reply('🏆 *Leaderboard is empty.*');
      const medals = ['🥇', '🥈', '🥉'];
      const lines = top.map((u, i) => {
        const crown = (u.items || []).includes('crown') ? ' 🤴' : ((u.items || []).includes('vip') ? ' 👑' : '');
        return `${medals[i] || `${i + 1}.`} @${u.jid}${crown} — *${u.coins} coins*`;
      }).join('\n');
      return reply(`🏆 *Rich List — Top 10*\n\n${lines}\n\nTum bhi aao: \`.daily\` \`.kaam\` \`.gamble\``);
    }
  },
  {
    command: 'gamble', aliases: [], category: 'economy',
    description: 'Coins bet karo — jeeto to double',
    usage: '.gamble <amount>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const bet = parseInt(args[0], 10);
      if (!bet) return reply('❌ Usage: `.gamble 50`\nMinimum bet 10 coins.');
      const r = eco.gamble(sender, bet);
      if (!r.ok) return reply('❌ ' + r.error);
      if (r.win) return reply(`🎉 *JEET GAYE!* 🪙\n\n+${r.bet} coins!\n💰 Balance: *${r.coins}*`);
      return reply(`💔 *Haar gaye!*\n\n-${r.bet} coins\n💰 Balance: *${r.coins}*\n\nPhir try karo, kismat badlegi! 🍀`);
    }
  },
  {
    command: 'kaam', aliases: [], category: 'economy',
    description: 'Kaam karke coins kamao (1 ghante me ek baar)',
    usage: '.kaam',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const jobs = ['chai banayi ☕', 'bot ki safai ki 🧹', 'group me welcome kiya 👋', 'sticker banaya 🎨', 'news padhi 📰'];
      const r = eco.work(sender);
      if (!r.ok) return reply(`⏳ Abhi thak gaye! Agla kaam *${r.wait}* baad.`);
      return reply(`💼 *Work done!* ${jobs[Math.floor(Math.random() * jobs.length)]}\n\n+${r.earned} coins\n💰 Balance: *${r.coins}*`);
    }
  },
  {
    command: 'rob', aliases: [], category: 'economy',
    description: 'Steal coins from another user (risky!)',
    usage: '.rob @user',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const to = targetJid(message, args);
      if (!to) return reply('📌 *Usage:* .rob @user');
      if (num(to) === num(sender)) return reply('❌ *You cannot rob yourself!*');
      const r = eco.rob(sender, to);
      if (!r.ok) return reply('❌ ' + r.error);
      if (r.win) return reply(`🦹 *Rob successful!*\n\n@${num(to)} se *${r.steal} coins* churaye!\n💰 Balance: *${r.coins}*`);
      return reply(`🚨 *Pakde gaye!* Rob fail.\n\nFine: -${r.fine} coins\n💰 Balance: *${r.coins}*`);
    }
  }
] };
