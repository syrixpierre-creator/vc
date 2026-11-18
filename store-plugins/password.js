/** QUEEN AKUMA Plugin Store — .password <length> */
module.exports = {
  command: 'password',
  aliases: ['genpass'],
  category: 'tools',
  description: 'Strong random password banao',
  usage: '.password [length]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    let len = parseInt(args[0], 10) || 12;
    if (len < 6) len = 6;
    if (len > 32) len = 32;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pw = '';
    for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    return reply(`🔐 *Password (${len} chars)*\n\n\`${pw}\`\n\n⚠️ Ise kisi ke saath share mat karo!`);
  }
};
