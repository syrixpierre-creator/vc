'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Multi-currency lib (Iris port).
 * 7 currencies: coin (economy) + diamond/rubi/stone/gold/iron/wood.
 * Fixed rates (coins per 1 unit): diamond 1000, rubi 500, gold 100,
 * stone 50, iron 20, wood 10. Coins economy.js me hain.
 * Data: data/currencies.json
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'currencies.json');
const RATES = { diamond: 1000, rubi: 500, gold: 100, stone: 50, iron: 20, wood: 10 };
const EMOJI = { diamond: '💎', rubi: '🔴', gold: '🥇', stone: '🪨', iron: '🔩', wood: '🪵' };
const NAMES = ['diamond', 'rubi', 'gold', 'stone', 'iron', 'wood'];

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
  if (!d[k]) d[k] = { diamond: 0, rubi: 0, gold: 0, stone: 0, iron: 0, wood: 0 };
  return d[k];
}
function setUser(jid, balances) {
  const d = load();
  d[key(jid)] = balances;
  save(d);
}
// from -> to conversion (via coins). Returns {ok, got} ya {ok:false, error}.
function exchange(jid, from, to, amount) {
  from = String(from || '').toLowerCase();
  to = String(to || '').toLowerCase();
  if (from === to) return { ok: false, error: 'Dono currency same hain.' };
  if (!NAMES.includes(from) && from !== 'coin') return { ok: false, error: 'Unknown currency: ' + from };
  if (!NAMES.includes(to) && to !== 'coin') return { ok: false, error: 'Unknown currency: ' + to };
  if (!amount || amount <= 0) return { ok: false, error: 'Amount 0 se bada hona chahiye.' };
  const economy = require('./economy');
  const cur = getUser(jid);
  const fromRate = from === 'coin' ? 1 : RATES[from];
  const toRate = to === 'coin' ? 1 : RATES[to];
  // Balance check + deduct
  if (from === 'coin') {
    const { user } = economy.getUser(jid);
    if ((user.coins || 0) < amount) return { ok: false, error: 'Coins kam hain. Wallet: ' + (user.coins || 0) };
    economy.addCoins(jid, -amount);
  } else {
    if ((cur[from] || 0) < amount) return { ok: false, error: from + ' kam hai. Balance: ' + (cur[from] || 0) };
    cur[from] -= amount;
  }
  const coinsValue = amount * fromRate;
  const got = Math.floor(coinsValue / toRate);
  if (got <= 0) return { ok: false, error: 'Itni chhoti amount se kuch nahi milega.' };
  if (to === 'coin') {
    economy.addCoins(jid, got);
  } else {
    cur[to] = (cur[to] || 0) + got;
  }
  setUser(jid, cur);
  return { ok: true, got, from, to, amount };
}

module.exports = { RATES, EMOJI, NAMES, getUser, setUser, exchange, key };
