 'use strict';
/**
 * QUEEN AKUMA — .eplstandings : English Premier League table (TheSportsDB, free test key 123).
 * VM se live-probed: 200, current season 2026-2027 (fallback 2025-2026).
 * Usage: .eplstandings
 */
async function fetchTable(season) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(
      'https://www.thesportsdb.com/api/v1/json/123/lookuptable.php?l=4328&s=' + season,
      { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0' } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return Array.isArray(d.table) && d.table.length ? d.table : null;
  } catch (e) { return null; }
  finally { clearTimeout(t); }
}

module.exports = {
  command: 'eplstandings',
  aliases: [],
  category: 'tools',
  description: 'Premier League table: .eplstandings',
  usage: '.eplstandings',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    let table = await fetchTable('2026-2027');
    let season = '2026-2027';
    if (!table) { table = await fetchTable('2025-2026'); season = '2025-2026'; }
    if (!table) {
      await reply('❌ *Failed to get the EPL table. Try again later.*');
      return;
    }
    const top = table.slice(0, 10).map((r) => {
      return r.intRank + '. ' + r.strTeam + ' — ' + r.intPlayed + 'P • ' + r.intPoints + ' pts'
        + ' (W' + r.intWin + ' D' + r.intDraw + ' L' + r.intLoss + ' • GD ' + r.intGoalDifference + ')';
    });
    await reply('⚽ *Premier League — Top ' + top.length + '* (' + season + ')\n\n' + top.join('\n'));
  },
};
