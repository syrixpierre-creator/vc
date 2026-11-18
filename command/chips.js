'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Chips economy (QUEEN AKUMA port).
 * Casino-chips currency, coins economy se alag. Naye user ko 1000 chips.
 * Rate: 10 coins = 1 chip. Data: data/chips.json
 */
const fs = require('fs');
const path = require('path');
const economy = require('../lib/economy');

const DATA_FILE = path.join(__dirname, '..', 'data', 'chips.json');
const START_CHIPS = 1000;
const COINS_PER_CHIP = 10;

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return {}; }
}
function save(d) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (e) {}
}
function key(jid) { return String(jid || '').replace(/:\d+@/, '@').split('@')[0]; }
function getUser(jid) {
  const d = load();
  const k = key(jid);
  if (!d[k]) d[k] = { chips: START_CHIPS, unlimited: false, tx: [] };
  return { store: d, user: d[k], k };
}
function logTx(user, type, amount, note) {
  user.tx = user.tx || [];
  user.tx.push({ type, amount, note: note || '', at: Date.now() });
  if (user.tx.length > 50) user.tx.splice(0, user.tx.length - 50);
}
function resolveTarget(sock, message, args, context) {
  const mentioned = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.mentionedJid;
  const quoted = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.participant;
  const raw = (args || [])[0];
  if (mentioned && mentioned[0]) return mentioned[0];
  if (quoted) return quoted;
  if (raw && /^\d{10,15}$/.test(raw.replace(/[^0-9]/g, ''))) return raw.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  return message.key.participant || context.senderId;
}

module.exports = {
  commands: [
    {
      command: 'checkbalance',
      aliases: ['chips', 'mybalance', 'chipbalance'],
      description: 'Apne chips ka balance dikhao.',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const sender = message.key.participant || context.senderId;
        const { user } = getUser(sender);
        await sock.sendMessage(chatId, { text: '🎰 *Chips Balance*\n\n' + (user.unlimited ? '♾️ Unlimited chips!\n' : '🪙 Chips: ' + Number(user.chips || 0).toLocaleString('en-IN') + '\n') + '\nKharido: *.buychips <amount>* (10 coins = 1 chip)' }, { quoted: message });
      }
    },
    {
      command: 'buychips',
      aliases: ['buychip'],
      description: 'Coins se chips kharido: .buychips <amount> (10 coins = 1 chip).',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const sender = message.key.participant || context.senderId;
        const n = parseInt((args || [])[0], 10);
        if (!n || n <= 0) { await reply('❌ Kitne chips chahiye? Example: *.buychips 100* (1000 coins lagenge)'); return; }
        const cost = n * COINS_PER_CHIP;
        const { user: ecoUser } = economy.getUser(sender);
        if ((ecoUser.coins || 0) < cost) {
          await reply('❌ Coins kam hain. ' + n + ' chips ke liye ' + cost.toLocaleString('en-IN') + ' coins chahiye. Wallet: ' + (ecoUser.coins || 0));
          return;
        }
        economy.addCoins(sender, -cost);
        const { store, user } = getUser(sender);
        user.chips = (user.chips || 0) + n;
        logTx(user, 'buy', n, cost + ' coins');
        save(store);
        await reply('✅ *' + n + ' chips* khareed liye (' + cost.toLocaleString('en-IN') + ' coins).\n🎰 Balance: ' + Number(user.chips).toLocaleString('en-IN') + ' chips');
      }
    },
    {
      command: 'addchips',
      aliases: ['givechips'],
      description: 'Kisi ko chips do (owner-only): .addchips <@user> <amount>',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const target = resolveTarget(sock, message, args, context);
        const n = parseInt((args || [])[args.length - 1], 10);
        if (!n || n <= 0) { await reply('❌ Usage: *.addchips <@user ya number> <amount>*'); return; }
        const { store, user } = getUser(target);
        user.chips = (user.chips || 0) + n;
        logTx(user, 'add', n, 'owner se');
        save(store);
        await reply('✅ *' + n + ' chips* de diye: ' + String(target).split('@')[0] + '\n🎰 Balance: ' + Number(user.chips).toLocaleString('en-IN'));
      }
    },
    {
      command: 'resetchips',
      aliases: ['clearchips'],
      description: 'Kisi ke chips reset karo (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const target = resolveTarget(sock, message, args, context);
        const { store, user } = getUser(target);
        user.chips = 0;
        user.unlimited = false;
        logTx(user, 'reset', 0, 'owner ne reset kiya');
        save(store);
        await reply('✅ Chips reset ho gaye: ' + String(target).split('@')[0] + ' (0 chips)');
      }
    },
    {
      command: 'transactions',
      aliases: ['chiptx', 'txhistory'],
      description: 'Apni last 10 chips transactions dikhao.',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const sender = message.key.participant || context.senderId;
        const { user } = getUser(sender);
        const tx = (user.tx || []).slice(-10).reverse();
        if (!tx.length) {
          await sock.sendMessage(chatId, { text: 'ℹ️ Abhi koi chips transaction nahi hai.' }, { quoted: message });
          return;
        }
        const lines = tx.map((t, i) => (i + 1) + '. ' + t.type + ' ' + (t.amount > 0 ? '+' : '') + t.amount + ' chips' + (t.note ? ' (' + t.note + ')' : '') + ' — ' + new Date(t.at).toLocaleDateString('en-IN'));
        await sock.sendMessage(chatId, { text: '📜 *Chips Transactions (last 10)*\n\n' + lines.join('\n') }, { quoted: message });
      }
    },
    {
      command: 'unlimitedchips',
      aliases: ['infchips'],
      description: 'Kisi ko unlimited chips do/hato (owner-only): .unlimitedchips <@user> on/off',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const target = resolveTarget(sock, message, args, context);
        const flag = String((args || [])[args.length - 1] || '').toLowerCase();
        const on = flag === 'on' || flag === 'true' || flag === 'enable';
        const { store, user } = getUser(target);
        user.unlimited = on;
        save(store);
        await reply(on ? '♾️ Unlimited chips ON: ' + String(target).split('@')[0] : '✅ Unlimited chips OFF: ' + String(target).split('@')[0]);
      }
    }
  ]
};
