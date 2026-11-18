// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'hug',
    aliases: ['cuddle', 'embrace'],
    category: 'fun',
    description: 'Hug someone with an anime GIF 🤗',
    usage: '.hug [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            await sock.sendMessage(chatId, {
                react: { text: '🤗', key: message.key }
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
                    `🤗 *HUG!*\n\n${senderTag} hugged ${targetTag}! 🤗💕`,
                    `🤗 *CUDDLE!*\n\n${senderTag} gave ${targetTag} a warm hug! 🤗`,
                    `🤗 *EMBRACE!*\n\n${senderTag} wrapped ${targetTag} in a hug! 🤗`
                ];
                caption = messages[Math.floor(Math.random() * messages.length)];
                mentions = [sender, target];
            } else {
                const selfMessages = [
                    `🤗 *HUG!*\n\n${senderTag} needs a hug! 🤗`,
                    `🤗 *CUDDLE!*\n\n${senderTag} wants to be cuddled! 🤗`,
                    `🤗 *EMBRACE!*\n\n${senderTag} is sending virtual hugs! 🤗`
                ];
                caption = selfMessages[Math.floor(Math.random() * selfMessages.length)];
            }

            const gifs = [
                'https://media.tenor.com/kCZjTqCKiggAAAAC/hug-anime.gif',
                'https://media.tenor.com/MA1Q7HRsZZAAAAAC/anime-hug.gif',
                'https://media.tenor.com/4xxOj5tU-J0AAAAC/anime-hug.gif'
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
                    text: ` ⟮ 🤗 ${botName} ⟯⊷\n *HUG*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: fakeSender });
            }

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Hug error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message || 'Failed to send hug'}`
            }, { quoted: fakeSender });
        }
    }
};