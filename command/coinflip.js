/**
 * QUEEN AKUMA • .coinflip — heads ya tails.
 */
module.exports = {
  command: 'coinflip',
  aliases: ['flip', 'coin', 'toss'],
  category: 'fun',
  description: 'Flip a coin',
  usage: '.coinflip',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const side = Math.random() < 0.5 ? 'Heads 👑' : 'Tails 🪙';
    const pick = (args || [])[0] ? String(args[0]).toLowerCase() : '';
    let extra = '';
    if (pick.startsWith('head')) extra = side.startsWith('Heads') ? '\n🎉 Tum jeet gaye!' : '\n😅 Tum haar gaye!';
    if (pick.startsWith('tail')) extra = side.startsWith('Tails') ? '\n🎉 Tum jeet gaye!' : '\n😅 Tum haar gaye!';
    await sock.sendMessage(chatId, { text: `🪙 *Coin Flip*\n\nResult: *${side}*${extra}` }, { quoted: message });
  }
};
