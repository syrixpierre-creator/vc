/**
 * QUEEN AKUMA v3.0.0 — Economy + Games
 * Coins kamao (daily / kaam / quiz / gamble), bazaar se items kharido,
 * doston ko coins bhejo, leaderboard pe chadho. Sab local JSON me save.
 */
const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'economy.json');
const DAILY_COINS = 100;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const WORK_COOLDOWN = 60 * 60 * 1000;
const ROB_COOLDOWN = 60 * 60 * 1000;

const SHOP = [
  { id: 'lucky', name: 'Lucky Charm', emoji: '🍀', price: 300, desc: 'Gamble jeetne ka chance 50% se 55%' },
  { id: 'shield', name: 'Shield', emoji: '🛡️', price: 400, desc: 'Ek baar .rob se bachata hai (use hone par khatm)' },
  { id: 'vip', name: 'VIP Badge', emoji: '👑', price: 500, desc: 'Balance card me VIP badge dikhega' },
  { id: 'crown', name: 'King Crown', emoji: '🤴', price: 1000, desc: 'Leaderboard me crown ke saath naam' },
  { id: 'diamond', name: 'Diamond', emoji: '💎', price: 2000, desc: 'Sabse rare item — sirf amiron ke liye' },
];

function load() {
  try { return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')); }
  catch (_) { return { users: {} }; }
}
function save(store) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
  } catch (_) {}
}
function key(jid) { return String(jid || '').replace(/:\d+@/, '@').split('@')[0]; }
function getUser(jid) {
  const store = load();
  const k = key(jid);
  if (!store.users[k]) store.users[k] = { coins: 0, items: [], lastDaily: 0, lastWork: 0, lastRob: 0, wins: 0, losses: 0, bank: 0, lastBonus: 0 };
  return { store, user: store.users[k], k };
}
function addCoins(jid, n) {
  const { store, user } = getUser(jid);
  user.coins = Math.max(0, (user.coins || 0) + n);
  save(store);
  return user.coins;
}
// v3.5.0 — bank persistence (.bank deposit/withdraw/bonus)
function setBank(jid, bank, lastBonus) {
  const { store, user } = getUser(jid);
  if (bank != null) user.bank = Math.max(0, bank);
  if (lastBonus != null) user.lastBonus = lastBonus;
  save(store);
  return user.bank;
}
function balance(jid) { return getUser(jid).user.coins || 0; }
function hasItem(jid, id) { return (getUser(jid).user.items || []).includes(id); }
function takeItem(jid, id) {
  const { store, user } = getUser(jid);
  user.items = (user.items || []).filter((x) => x !== id);
  save(store);
}
function daily(jid) {
  const { store, user } = getUser(jid);
  const now = Date.now();
  if (now - (user.lastDaily || 0) < DAILY_COOLDOWN) {
    const left = DAILY_COOLDOWN - (now - user.lastDaily);
    const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000);
    return { ok: false, wait: `${h}h ${m}m` };
  }
  user.lastDaily = now;
  user.coins = (user.coins || 0) + DAILY_COINS;
  save(store);
  return { ok: true, coins: user.coins, got: DAILY_COINS };
}
function work(jid) {
  const { store, user } = getUser(jid);
  const now = Date.now();
  if (now - (user.lastWork || 0) < WORK_COOLDOWN) {
    const left = WORK_COOLDOWN - (now - user.lastWork);
    return { ok: false, wait: `${Math.ceil(left / 60000)} min` };
  }
  user.lastWork = now;
  const earned = 20 + Math.floor(Math.random() * 61);
  user.coins = (user.coins || 0) + earned;
  save(store);
  return { ok: true, coins: user.coins, earned };
}
function gamble(jid, bet) {
  const { store, user } = getUser(jid);
  if (!Number.isFinite(bet) || bet < 10) return { ok: false, error: 'Minimum bet 10 coins hai.' };
  if ((user.coins || 0) < bet) return { ok: false, error: `Tumhare paas sirf ${user.coins || 0} coins hain.` };
  const chance = hasItem(jid, 'lucky') ? 0.55 : 0.5;
  const win = Math.random() < chance;
  if (win) { user.coins += bet; user.wins = (user.wins || 0) + 1; }
  else { user.coins -= bet; user.losses = (user.losses || 0) + 1; }
  save(store);
  return { ok: true, win, coins: user.coins, bet, chance };
}
function newUser() { return { coins: 0, items: [], lastDaily: 0, lastWork: 0, lastRob: 0, wins: 0, losses: 0 }; }
function getTwo(jidA, jidB) {
  const store = load();
  const ka = key(jidA), kb = key(jidB);
  if (!store.users[ka]) store.users[ka] = newUser();
  if (!store.users[kb]) store.users[kb] = newUser();
  return { store, a: store.users[ka], b: store.users[kb] };
}
function rob(robberJid, victimJid) {
  const { store, a: r, b: v } = getTwo(robberJid, victimJid);
  const now = Date.now();
  if (now - (r.lastRob || 0) < ROB_COOLDOWN) {
    return { ok: false, error: `Thoda ruko! Agla rob ${Math.ceil((ROB_COOLDOWN - (now - r.lastRob)) / 60000)} min baad.` };
  }
  r.lastRob = now;
  if ((v.items || []).includes('shield')) {
    v.items = v.items.filter((x) => x !== 'shield');
    save(store);
    return { ok: false, error: '🛡️ Victim ke paas Shield tha! Rob fail, shield toot gaya.' };
  }
  if ((v.coins || 0) < 100) { save(store); return { ok: false, error: 'Victim ke paas 100 se kam coins hain, rob karne layak nahi.' }; }
  if (Math.random() < 0.4) {
    const steal = Math.floor((v.coins || 0) * (0.1 + Math.random() * 0.15));
    v.coins -= steal; r.coins = (r.coins || 0) + steal;
    save(store);
    return { ok: true, win: true, steal, coins: r.coins };
  }
  r.coins = Math.max(0, (r.coins || 0) - 50);
  save(store);
  return { ok: true, win: false, fine: 50, coins: r.coins };
}
function transfer(fromJid, toJid, amount) {
  if (!Number.isFinite(amount) || amount < 1) return { ok: false, error: 'Amount 1 ya zyada honi chahiye.' };
  const { store, a: f, b: t } = getTwo(fromJid, toJid);
  if ((f.coins || 0) < amount) return { ok: false, error: `Tumhare paas sirf ${f.coins || 0} coins hain.` };
  f.coins -= amount;
  t.coins = (t.coins || 0) + amount;
  save(store);
  return { ok: true, from: f.coins, to: t.coins };
}
function buy(jid, itemId) {
  const item = SHOP.find((s) => s.id === itemId);
  if (!item) return { ok: false, error: 'Aisa koi item nahi. `.bazaar` se list dekho.' };
  const { store, user } = getUser(jid);
  if ((user.items || []).includes(item.id)) return { ok: false, error: `Tumhare paas ${item.emoji} ${item.name} pehle se hai.` };
  if ((user.coins || 0) < item.price) return { ok: false, error: `${item.emoji} ${item.name} ke liye ${item.price} coins chahiye, tumhare paas ${user.coins || 0} hain.` };
  user.coins -= item.price;
  user.items = [...(user.items || []), item.id];
  save(store);
  return { ok: true, item, coins: user.coins };
}
function leaderboard(limit = 10) {
  const store = load();
  return Object.entries(store.users || {})
    .map(([jid, u]) => ({ jid, coins: u.coins || 0, items: u.items || [] }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, limit);
}

module.exports = { SHOP, DAILY_COINS, getUser, addCoins, balance, hasItem, daily, work, gamble, rob, transfer, buy, leaderboard, key, setBank };
