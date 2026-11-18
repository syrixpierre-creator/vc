// import config from '../config.js';

module.exports = {
    command: 'slap',
    aliases: ['hit', 'smack'],
    category: 'fun',
    description: 'Slap someone with an anime GIF 👋',
    usage: '.slap [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            await sock.sendMessage(chatId, {
                react: { text: '👋', key: message.key }
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
                    `👋 *SLAP!*\n\n${senderTag} slapped ${targetTag}! 💥`,
                    `👋 *SMACK!*\n\n${senderTag} smacked ${targetTag}! 💢`,
                    `👋 *FIVE!*\n\n${senderTag} gave ${targetTag} a slap! 👋`
                ];
                caption = messages[Math.floor(Math.random() * messages.length)];
                mentions = [sender, target];
            } else {
                const selfMessages = [
                    `👋 *SLAP!*\n\n${senderTag} slapped themselves! 💥`,
                    `👋 *SMACK!*\n\n${senderTag} is giving themselves a wake-up call! 💢`,
                    `👋 *FIVE!*\n\n${senderTag} is practicing their slaps! 👋`
                ];
                caption = selfMessages[Math.floor(Math.random() * selfMessages.length)];
            }

            // Fetch GIF
            let gifBuffer = null;
            const gifUrls = [
                'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
                'https://media.giphy.com/media/xT0BKiwiVJq5B0XhHG/giphy.gif',
                'https://media.tenor.com/8n7JQYvZ8ScAAAAC/anime-slap.gif'
            ];

            for (const url of gifUrls) {
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
                    // The correct way: Upload media first
                    const uploadedMedia = await sock.uploadMedia(gifBuffer);

                    await sock.sendMessage(chatId, {
                        video: uploadedMedia,
                        gifPlayback: true,
                        mimetype: 'video/mp4',
                        caption: caption,
                        mentions: mentions
                    }, { quoted: message }); // Use message, NOT fakeSender

                } catch (uploadError) {
                    console.error('Upload error:', uploadError);

                    // Fallback: Send as sticker
                    try {
                        await sock.sendMessage(chatId, {
                            sticker: gifBuffer,
                            mimetype: 'image/gif'
                        }, { quoted: message });

                        await sock.sendMessage(chatId, {
                            text: caption,
                            mentions: mentions
                        }, { quoted: message });
                    } catch {
                        // Final fallback: Text only
                        await sock.sendMessage(chatId, {
                            text: ` ⟮ 👋 ${botName} ⟯⊷\n *SLAP*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                            mentions: mentions
                        }, { quoted: message });
                    }
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: ` ⟮ 👋 ${botName} ⟯⊷\n *SLAP*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Slap error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message || 'Failed to send slap'}`
            }, { quoted: message }).catch(() => {});
        }
    }
};