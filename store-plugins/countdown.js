/** QUEEN AKUMA Plugin Store — .countdown <date> */
module.exports = {
  command: 'countdown',
  aliases: ['count'],
  category: 'tools',
  description: 'Kisi date tak kitna time bacha hai',
  usage: '.countdown 2026-12-31',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const raw = (args[0] || '').trim();
    const target = new Date(raw);
    if (!raw || isNaN(target.getTime())) return reply('❌ Usage: `.countdown 2026-12-31`\nDate YYYY-MM-DD format me do.');
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return reply(`⏰ *${raw}* guzar chuka hai!`);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return reply(`⏳ *Countdown: ${raw}*\n\n📅 ${d} din, ${h} ghante, ${m} minute bache hain!`);
  }
};
