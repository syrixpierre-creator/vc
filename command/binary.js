// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'binary',
    aliases: ['bin'],
    category: 'utility',
    description: 'Convert text to/from binary',
    usage: '.binary encode <text> | .binary decode <binary>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        if (args.length < 2) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 💻 ${botName} ⟯⊷
 *BINARY CONVERTER*

 *Usage:*
 .binary encode <text>
 .binary decode <binary>

 *Example:*
 .binary encode Hello
 .binary decode 01001000 01100101
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
            return;
        }

        const mode = args[0].toLowerCase();
        const input = args.slice(1).join(' ');

        if (mode === 'encode') {
            const result = input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
            await sock.sendMessage(chatId, {
                text: `💻 *Binary Encoded*\n\nText: ${input}\nBinary: \`${result}\``
            }, { quoted: fakeSender });
        } else if (mode === 'decode') {
            try {
                const result = input.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
                await sock.sendMessage(chatId, {
                    text: `💻 *Binary Decoded*\n\nBinary: ${input}\nText: *${result}*`
                }, { quoted: fakeSender });
            } catch {
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid binary input. Make sure to use spaces between each 8-bit binary number.'
                }, { quoted: fakeSender });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Mode must be `encode` or `decode`'
            }, { quoted: fakeSender });
        }
    }
};