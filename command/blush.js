// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'blush',
    aliases: ['shy', 'embarrassed'],
    category: 'fun',
    description: 'Blush, optionally at someone',
    usage: '.blush [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            await sock.sendMessage(chatId, {
                react: { text: '☺️', key: message.key }
            }).catch(() => {});

            const sender = message.key.participant || message.key.remoteJid;
            const senderTag = '@' + sender.split('@')[0];

            let target = null;
            const ctx = message.message?.extendedTextMessage?.contextInfo;

            // Check for mentioned JIDs
            if (ctx?.mentionedJid?.length) {
                target = ctx.mentionedJid[0];
            }
            // Check if replying to a message
            else if (ctx?.participant) {
                target = ctx.participant;
            }
            // Check if phone number in args
            else if (args.length) {
                const digits = args[0].replace(/[^0-9]/g, '');
                if (digits) target = digits + '@s.whatsapp.net';
            }

            let caption;
            let mentions = [sender];

            if (target && target !== sender) {
                const targetTag = '@' + target.split('@')[0];
                const messages = [
                    `☺️ *BLUSH!*\n\n${senderTag} blushed at ${targetTag}! 💕`,
                    `☺️ *SHY!*\n\n${senderTag} is blushing around ${targetTag}! 🥰`,
                    `☺️ *CRUSH!*\n\n${senderTag} blushed looking at ${targetTag}! 😊`
                ];
                caption = messages[Math.floor(Math.random() * messages.length)];
                mentions = [sender, target];
            } else {
                const selfMessages = [
                    `☺️ *BLUSH!*\n\n${senderTag} is blushing! 💕`,
                    `☺️ *SHY!*\n\n${senderTag} is feeling shy! 🥰`,
                    `☺️ *EMBARRASSED!*\n\n${senderTag} is blushing heavily! 😊`
                ];
                caption = selfMessages[Math.floor(Math.random() * selfMessages.length)];
            }

            const gifs = [
                'https://media.tenor.com/QXMlGn3jOOcAAAAC/anime-blush.gif',
                'https://media.tenor.com/0xK0bF5IZkkAAAAC/anime-shy.gif',
                'https://media.tenor.com/yNk7ZRr5wB8AAAAC/anime-blush.gif'
            ];

            let gifBuffer = null;
            for (const url of gifs) {
                try {
                    const response = await fetch(url, {
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
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
                    text: ` ⟮ ☺️ ${botName} ⟯⊷\n *BLUSH*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: fakeSender });
            }

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Blush error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message || 'Failed to send blush reaction'}`
            }, { quoted: fakeSender });
        }
    }
};