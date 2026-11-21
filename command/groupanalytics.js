/**
 * QUEEN AKUMA v3.5.0 • #1 Group Analytics (queen-akuma)
 * .analytics — overview (total msgs, active members, peak hour, top 5)
 * .analytics top — top 15 members
 * .peakhours — 24-hour activity chart
 * Har group message onMessage hook se track hota hai (lib/groupAnalytics.js).
 */
const ga = require('../lib/groupAnalytics');

module.exports = {
  command: 'analytics',
  aliases: ['peakhours', 'groupanalytics'],
  category: 'group',
  description: 'Group chat analytics — top members, peak hours, activity stats',
  usage: '.analytics | .analytics top | .peakhours',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t, mentions) => sock.sendMessage(chatId, { text: t, mentions: mentions || [] }, { quoted: message });
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'analytics').toLowerCase();
    const data = ga.getStats(chatId);
    if (!data || data.totalMessages === 0) {
      return reply('📊 *No analytics data yet.*');
    }
    if (invoked === 'peakhours') {
      const maxH = Math.max(...data.hourly);
      let chart = '🕐 *Peak Hours*\n\n';
      for (let h = 0; h < 24; h++) {
        const val = data.hourly[h];
        if (val > 0) chart += `${String(h).padStart(2, '0')}:00 ${ga.makeBar(val, maxH, 12)} ${val}\n`;
      }
      return reply(chart);
    }
    const sorted = Object.entries(data.members).sort((a, b) => b[1].count - a[1].count);
    if ((args[0] || '').toLowerCase() === 'top') {
      const top = sorted.slice(0, 15);
      const maxCount = top[0][1].count;
      const list = top.map(([user, info], i) => `${i + 1}. @${user.split('@')[0]} — ${info.count} msgs ${ga.makeBar(info.count, maxCount, 8)}`).join('\n');
      return reply(`👥 *Top Members*\n\n${list}`, top.map(([u]) => u));
    }
    const duration = ga.formatDuration(Date.now() - data.since);
    const memberCount = Object.keys(data.members).length;
    const topMember = sorted[0];
    const peakHour = data.hourly.indexOf(Math.max(...data.hourly));
    const avgPerMember = Math.round(data.totalMessages / Math.max(1, memberCount));
    const top5 = sorted.slice(0, 5).map(([user, info], i) => `${i + 1}. @${user.split('@')[0]} — ${info.count} msgs`).join('\n');
    return reply(
      `📊 *Group Analytics*\n\n⏱️ *Tracking since:* ${duration} ago\n📨 *Total messages:* ${data.totalMessages}\n👥 *Active members:* ${memberCount}\n📈 *Avg per member:* ${avgPerMember}\n🕐 *Peak hour:* ${String(peakHour).padStart(2, '0')}:00\n\n🏆 *Top 5 Members:*\n${top5}\n\n_Use \`.analytics top\` for full leaderboard_\n_Use \`.peakhours\` for hourly chart_`,
      sorted.slice(0, 5).map(([u]) => u)
    );
  },
  async onMessage(sock, message, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = context.senderId || message.key.participant || message.key.remoteJid;
    ga.trackMessage(chatId, sender);
    return false;
  },
};
