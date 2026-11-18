'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .diff (raganork port).
 * Do groups ke members ka diff dikhao.
 * Usage: .diff <group1> <group2> — naam ka hissa ya poora JID.
 */
module.exports = {
  command: 'diff',
  aliases: ['groupdiff', 'memberdiff'],
  description: 'Do groups ke members ka diff dikhao.',
  category: 'group',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const q1 = (args || [])[0], q2 = (args || [])[1];
    if (!q1 || !q2) {
      await reply('❌ Do groups do.\nUsage: *.diff <group1> <group2>*\nNaam ka hissa bhi chalega. Example: .diff Sharma Family | Friends');
      return;
    }
    let groups = {};
    try {
      groups = await sock.groupFetchAllParticipating();
    } catch (e) {
      await reply('❌ Groups ki list nahi mili: ' + String(e.message || e).slice(0, 100));
      return;
    }
    const list = Object.values(groups || {});
    const find = (q) => {
      const s = String(q).toLowerCase();
      return list.find((g) => String(g.id) === q) ||
        list.find((g) => (g.subject || '').toLowerCase() === s) ||
        list.find((g) => (g.subject || '').toLowerCase().includes(s));
    };
    const g1 = find(q1), g2 = find(q2);
    if (!g1 || !g2) {
      await reply('❌ Group nahi mila: ' + (!g1 ? '"' + q1 + '"' : '"' + q2 + '"') + '\nBot dono groups me hona chahiye.');
      return;
    }
    const set1 = new Set((g1.participants || []).map((p) => String(p.id).split('@')[0]));
    const set2 = new Set((g2.participants || []).map((p) => String(p.id).split('@')[0]));
    const only1 = [...set1].filter((x) => !set2.has(x));
    const only2 = [...set2].filter((x) => !set1.has(x));
    const common = [...set1].filter((x) => set2.has(x));
    const show = (arr) => arr.slice(0, 25).join('\n') + (arr.length > 25 ? '\n...aur ' + (arr.length - 25) : '');
    await reply('👥 *Group Diff*\n\n' +
      '📌 *' + (g1.subject || g1.id) + '* (' + set1.size + ' members)\n' +
      '📌 *' + (g2.subject || g2.id) + '* (' + set2.size + ' members)\n\n' +
      '🤝 Common: ' + common.length + '\n' +
      '➡️ Sirf Group 1 me (' + only1.length + '):\n' + (only1.length ? show(only1) : '—') + '\n\n' +
      '⬅️ Sirf Group 2 me (' + only2.length + '):\n' + (only2.length ? show(only2) : '—'));
  }
};
