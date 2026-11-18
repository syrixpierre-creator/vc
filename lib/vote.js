/**
 * QUEEN AKUMA v3.4.0 — Vote System (Levanter #8, real implementation)
 * data/vote.json: { [chatId]: { question, options[], votes: { jid: idx }, createdBy, createdAt, open } }
 * .poll se alag: har member ek vote deta hai, vote badal sakta hai, tally + winner.
 */
const fs = require('fs');
const path = require('path');
const PATH = path.join(__dirname, '..', 'data', 'vote.json');
function load() { try { return JSON.parse(fs.readFileSync(PATH, 'utf8')); } catch (_) { return {}; } }
function save(d) { try { fs.mkdirSync(path.dirname(PATH), { recursive: true }); fs.writeFileSync(PATH, JSON.stringify(d, null, 2)); } catch (_) {} }
function get(chatId) { const v = load()[chatId]; return v && v.open ? v : null; }
function start(chatId, question, options, createdBy) {
  const d = load();
  if (d[chatId] && d[chatId].open) return { ok: false, error: 'Is group me ek vote pehle se chal raha hai. Pehle `.vote end` karo.' };
  d[chatId] = { question, options, votes: {}, createdBy, createdAt: Date.now(), open: true };
  save(d);
  return { ok: true, vote: d[chatId] };
}
function cast(chatId, jid, choice) {
  const d = load();
  const v = d[chatId];
  if (!v || !v.open) return { ok: false, error: 'Is group me koi vote nahi chal raha. Start karo: `.vote <sawal> | <opt1> | <opt2>`' };
  let idx = -1;
  const n = parseInt(String(choice), 10);
  if (!Number.isNaN(n) && n >= 1 && n <= v.options.length) idx = n - 1;
  else idx = v.options.findIndex((o) => o.toLowerCase() === String(choice).trim().toLowerCase());
  if (idx < 0) return { ok: false, error: `Option nahi mili. Options: ${v.options.map((o, i) => `${i + 1}. ${o}`).join(', ')}` };
  const changed = jid in v.votes;
  v.votes[jid] = idx;
  save(d);
  return { ok: true, option: v.options[idx], changed };
}
function tally(v) {
  const counts = v.options.map(() => 0);
  Object.values(v.votes).forEach((idx) => { if (counts[idx] !== undefined) counts[idx]++; });
  const total = Object.keys(v.votes).length;
  return { counts, total };
}
function results(chatId) {
  const v = get(chatId);
  if (!v) return null;
  return { vote: v, ...tally(v) };
}
function end(chatId) {
  const d = load();
  const v = d[chatId];
  if (!v || !v.open) return null;
  v.open = false;
  save(d);
  const t = tally(v);
  let winnerIdx = 0;
  t.counts.forEach((c, i) => { if (c > t.counts[winnerIdx]) winnerIdx = i; });
  return { vote: v, ...t, winner: v.options[winnerIdx], winnerVotes: t.counts[winnerIdx] };
}
function fmt(v, counts, total) {
  return v.options.map((o, i) => {
    const c = counts[i];
    const pct = total ? Math.round((c / total) * 100) : 0;
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
    return `${i + 1}. ${o} — *${c} vote* (${pct}%)\n   ${bar}`;
  }).join('\n');
}
module.exports = { get, start, cast, results, end, fmt, load, save };
