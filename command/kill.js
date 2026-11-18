// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'kill',
    aliases: ['murder', 'slay'],
    category: 'fun',
    description: 'Kill someone with an anime GIF 🔪',
    usage: '.kill [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            await sock.sendMessage(chatId, {
                react: { text: '🔪', key: message.key }
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
                    `🔪 *KILL!*\n\n${senderTag} killed ${targetTag}! 💀`,
                    `🔪 *MURDER!*\n\n${senderTag} murdered ${targetTag}! ☠️`,
                    `🔪 *SLAY!*\n\n${senderTag} slayed ${targetTag}! 🗡️`
                ];
                caption = messages[Math.floor(Math.random() * messages.length)];
                mentions = [sender, target];
            } else {
                const selfMessages = [
                    `🔪 *KILL!*\n\n${senderTag} is plotting a murder... 💀`,
                    `🔪 *MURDER!*\n\n${senderTag} is planning something sinister... ☠️`,
                    `🔪 *SLAY!*\n\n${senderTag} is sharpening their blade... 🗡️`
                ];
                caption = selfMessages[Math.floor(Math.random() * selfMessages.length)];
            }

            const gifs = [
                'https://media.giphy.com/media/xT0BKiwiVJq5B0XhHG/giphy.gif',
                'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
                'https://media.tenor.com/8n7JQYvZ8ScAAAAC/anime-kill.gif'
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
                    text: ` ⟮ 🔪 ${botName} ⟯⊷\n *KILL*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: fakeSender });
            }

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Kill error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message || 'Failed to send kill'}`
            }, { quoted: fakeSender });
        }
    }
};