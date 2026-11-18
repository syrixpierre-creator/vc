// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'awoo',
    aliases: ['howl', 'awooo'],
    category: 'fun',
    description: 'Awoo! 🐺',
    usage: '.awoo [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            await sock.sendMessage(chatId, {
                react: { text: '🐺', key: message.key }
            }).catch(() => {});

            const sender = message.key.participant || message.key.remoteJid;
            const senderTag = '@' + sender.split('@')[0];

            let target = null;
            const ctx = message.message?.extendedTextMessage?.contextInfo;

            if (ctx?.mentionedJid?.length) {
                target = ctx.mentionedJid[0];
            } else if (ctx?.participant) {
                target = ctx.participant;
            } else if (args.length) {
                const digits = args[0].replace(/[^0-9]/g, '');
                if (digits) target = digits + '@s.whatsapp.net';
            }

            let caption;
            let mentions = [sender];

            if (target && target !== sender) {
                const targetTag = '@' + target.split('@')[0];
                const messages = [
                    `🐺 *AWOO!*\n\n${senderTag} awoo'd at ${targetTag}! 🐺`,
                    `🐺 *HOWL!*\n\n${senderTag} is howling at ${targetTag}! 🐺`,
                    `🐺 *WOLF!*\n\n${senderTag} awoo'd towards ${targetTag}! 🐺`
                ];
                caption = messages[Math.floor(Math.random() * messages.length)];
                mentions = [sender, target];
            } else {
                const selfMessages = [
                    `🐺 *AWOO!*\n\n${senderTag} is howling awooooo! 🐺`,
                    `🐺 *HOWL!*\n\n${senderTag} is howling at the moon! 🌙🐺`,
                    `🐺 *WOLF!*\n\n${senderTag} is awoo-ing loudly! 🐺`
                ];
                caption = selfMessages[Math.floor(Math.random() * selfMessages.length)];
            }

            const gifs = [
                'https://media.tenor.com/5HWnvc7vGSwAAAAC/awoo-anime.gif',
                'https://media.tenor.com/1x0y3Z8Q4VcAAAAC/awoo.gif',
                'https://media.tenor.com/7tq8gK3xZ2MAAAAC/awoo-anime.gif'
            ];

            let gifBuffer = null;
            for (const url of gifs) {
                try {
                    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        if (buffer.byteLength > 100) {
                            gifBuffer = Buffer.from(buffer);
                            break;
                        }
                    }
                } catch { continue; }
            }

            if (gifBuffer) {
                try {
                    await sock.sendMessage(chatId, {
                        video: gifBuffer,
                        gifPlayback: true,
                        mimetype: 'video/mp4',
                        caption: caption,
                        mentions: mentions
                    }, { quoted: fakeSender });
                } catch {
                    await sock.sendMessage(chatId, {
                        image: gifBuffer,
                        mimetype: 'image/gif',
                        caption: caption,
                        mentions: mentions
                    }, { quoted: fakeSender });
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: ` ⟮ 🐺 ${botName} ⟯⊷\n *AWOO!*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: fakeSender });
            }

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Awoo error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message || 'Failed to send awoo reaction'}`
            }, { quoted: fakeSender });
        }
    }
};