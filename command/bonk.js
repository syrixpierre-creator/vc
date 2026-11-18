// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'bonk',
    aliases: ['bonk'],
    category: 'fun',
    description: 'Bonk someone to horny jail',
    usage: '.bonk [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        const sender = message.key.participant || message.key.remoteJid;
        const senderTag = '@' + sender.split('@')[0];

        let target = null;
        const ctx = message.message?.extendedTextMessage?.contextInfo;

        if (ctx?.mentionedJid?.length) {
            target = ctx.mentionedJid[0];
        } else if (ctx?.participant) {
            target = ctx.participant;
        } else if (args.length) {
            const input = args.join(' ').trim();
            if (/^[0-9]+$/.test(input.replace(/[^0-9]/g, ''))) {
                const digits = input.replace(/[^0-9]/g, '');
                if (digits) target = digits + '@s.whatsapp.net';
            }
        }

        let finalMessage;
        let mentions = [sender];

        const messages = [
            "Bonk! {target} go to horny jail! 🔨",
            "{target} just got bonked! 🔨",
            "Bonking {target} as we speak! 🔨",
            "🔨 *BONK!* {target} has been sent to horny jail!",
            "Straight to horny jail for {target}! 🔨"
        ];

        if (target && target !== sender) {
            const targetTag = '@' + target.split('@')[0];
            finalMessage = messages[Math.floor(Math.random() * messages.length)].replace(/\{target\}/g, targetTag);
            mentions = [sender, target];
        } else {
            const selfMessages = [
                "Why would you bonk yourself? 🤔",
                "You bonked yourself! That's... interesting 😅",
                "Self-bonk! You need a hug? 🫂"
            ];
            finalMessage = selfMessages[Math.floor(Math.random() * selfMessages.length)];
        }

        const bonkGifs = [
            'https://media.tenor.com/0f55gW4N3ncAAAAC/bonk-dog-bonk.gif',
            'https://media.tenor.com/g7VrJhXm6DcAAAAC/bonk-bonk.gif',
            'https://media.tenor.com/8u9pWzrNvQIAAAAC/bonk-horny-jail.gif'
        ];

        let gifBuffer = null;
        for (const url of bonkGifs) {
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
                    caption: `🔨 *${botName}*\n\n${finalMessage}`,
                    mentions: mentions
                }, { quoted: fakeSender });
            } catch {
                await sock.sendMessage(chatId, {
                    text: ` ⟮ 🔨 ${botName} ⟯⊷\n *BONK!*\n\n ${finalMessage}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: fakeSender });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🔨 ${botName} ⟯⊷\n *BONK!*\n\n ${finalMessage}\n⊷\n\n_⚡ Powered by ${botName}_`,
                mentions: mentions
            }, { quoted: fakeSender });
        }
    }
};