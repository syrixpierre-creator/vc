/**
 * QUEEN AKUMA v3.5.0 • #44 .getbio — kisi bhi user ki WhatsApp bio (QUEEN AKUMA se)
 * Group me: .getbio @user ya kisi ke message par reply karke .getbio
 * DM me: .getbio (khud ki) ya reply karke.
 * Baileys fetchStatus — koi API/key nahi.
 */
module.exports = {
  command: 'getbio',
  aliases: ['getabout'],
  category: 'main',
  description: 'Get any user WhatsApp bio/about',
  usage: '.getbio @user | .getbio (reply to a message)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = context.senderId || message.key.participant || message.key.remoteJid;
    const reply = (t, mentions) => sock.sendMessage(chatId, { text: t, mentions: mentions || [] }, { quoted: message });
    const m = message.message || {};
    const ctxInfo = m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo || {};
    const mentioned = ctxInfo.mentionedJid || [];
    const who = mentioned[0] || ctxInfo.participant || sender;
    try {
      const res = await sock.fetchStatus(who);
      const bio = (res && res.status) || '';
      const when = res && res.setAt ? new Date(res.setAt).toLocaleString('en-IN') : '';
      if (!bio) return reply(`📝 @${who.split('@')[0]} ki bio khaali hai.`, [who]);
      return reply(`📝 *Bio — @${who.split('@')[0]}*\n\n${bio}${when ? `\n\n_Set: ${when}_` : ''}`, [who]);
    } catch (e) {
      return reply(`❌ Bio nahi mil payi — @${who.split('@')[0]} ki bio private ho sakti hai.`, [who]);
    }
  },
};
