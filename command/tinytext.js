/*****************************************************************************
 *                                                                           *
 *                QUEEN AKUMA  •  MADE BY INCONNU BOY SENSEI                 *
 *                                                                           *
 *  📢  Channel : INCONNU BOY SENSEI                                         *
 *  🔗  Link    : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J      *
 *                                                                           *
 *****************************************************************************/


module.exports = {
  command: 'smallcaps',
  aliases: ['tinytext', 'mini'],
  category: 'tools',
  description: 'Convert text to small-capital style',
  usage: '.smallcaps <text> OR reply to a message',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;

    try {
      let txt = args?.join(' ') || "";
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
      }

      txt = txt.replace(/^\.\w+\s*/, '').trim();

      if (!txt) {
        return await sock.sendMessage(chatId, {
          text: 'Please provide text or reply to a message to convert.\nExample: `.smallcaps Hello World`'
        }, { quoted: message });
      }

    const capsMap = {
        'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'h': 'H', 'i': 'I', 'j': 'J',
        'k': 'K', 'l': 'L', 'm': 'M', 'n': 'N', 'o': 'O', 'p': 'P', 'q': 'ǫ', 'r': 'R', 's': 's', 't': 'T',
        'u': 'U', 'v': 'V', 'w': 'W', 'x': 'x', 'y': 'Y', 'z': 'Z',
        'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J',
        'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P', 'Q': 'ǫ', 'R': 'R', 'S': 's', 'T': 'T',
        'U': 'U', 'V': 'V', 'W': 'W', 'X': 'x', 'Y': 'Y', 'Z': 'Z',
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };

    const result = txt.split('').map(char => capsMap[char] || char).join('');
      await sock.sendMessage(chatId, { text: result }, { quoted: message });

    } catch (err) {
      console.error('SmallCaps Error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to process text.' });
    }
  }
};

/*****************************************************************************
 *                                                                           *
 *                QUEEN AKUMA  •  MADE BY INCONNU BOY SENSEI                 *
 *                                                                           *
 *  📢  Channel : INCONNU BOY SENSEI                                         *
 *  🔗  Link    : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J      *
 *                                                                           *
 *****************************************************************************/
