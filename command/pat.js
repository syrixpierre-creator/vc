// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'pat',
    aliases: ['headpat', 'pet'],
    category: 'fun',
    description: 'Pat someone on the head ✋',
    usage: '.pat [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        try {
            await sock.sendMessage(chatId, {
                react: { text: '✋', key: message.key }
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
                    `✋ *PAT!*\n\n${senderTag} patted ${targetTag} on the head! ✋`,
                    `✋ *HEADPAT!*\n\n${senderTag} gave ${targetTag} headpats! ✨`,
                    `✋ *GOOD BOY!*\n\n${senderTag} gently patted ${targetTag}! ✋`
                ];
                caption = messages[Math.floor(Math.random() * messages.length)];
                mentions = [sender, target];
            } else {
                const selfMessages = [
                    `✋ *PAT!*\n\n${senderTag} wants headpats! ✋`,
                    `✋ *HEADPAT!*\n\n${senderTag} is waiting for pats! ✨`,
                    `✋ *PET!*\n\n${senderTag} needs to be petted! ✋`
                ];
                caption = selfMessages[Math.floor(Math.random() * selfMessages.length)];
            }

            const gifs = [
                'https://media.tenor.com/0r3HOgZ3rGoAAAAC/anime-pat.gif',
                'https://media.tenor.com/E2zaIRGsxhMAAAAC/anime-pat.gif',
                'https://media.tenor.com/5G3W8Y4hVtoAAAAC/anime-headpat.gif'
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
                    text: ` ⟮ ✋ ${botName} ⟯⊷\n *PAT*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: fakeSender });
            }

            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => {});

        } catch (error) {
            console.error('Pat error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message || 'Failed to send pat'}`
            }, { quoted: fakeSender });
        }
    }
};