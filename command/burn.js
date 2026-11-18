// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'burn',
    aliases: ['roast', 'insult'],
    category: 'fun',
    description: 'Burn/roast someone with a savage insult',
    usage: '.burn [@mention or reply to message]',
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

        const burns = [
            "Roasting {target} like marshmallows over hellfire. 🔥",
            "I would insult {target} but reality already did. 💀",
            "{target} brings nothing to the table — not even the table. 🪑",
            "If {target} was any more basic, they'd be a flip phone. 📱",
            "{target} is proof that evolution can go backwards. 🧬",
            "The only thing {target} contributes to society is a warning label. ⚠️",
            "{target} has the personality of a wet napkin. 🧻",
            "I'd agree with {target} but then we'd both be wrong. 🤡"
        ];

        if (target && target !== sender) {
            const targetTag = '@' + target.split('@')[0];
            finalMessage = burns[Math.floor(Math.random() * burns.length)].replace(/\{target\}/g, targetTag);
            mentions = [sender, target];
        } else {
            const selfBurns = [
                "Why are you roasting yourself? 😅",
                "Self-burn! Those are rare! 🔥",
                "Taking self-deprecation to a whole new level! 😂"
            ];
            finalMessage = selfBurns[Math.floor(Math.random() * selfBurns.length)];
        }

        const burnGifs = [
            'https://media.tenor.com/2VpldPG9RVoAAAAC/burn-fire.gif',
            'https://media.tenor.com/3aB1rWB_sYgAAAAC/fire-burning.gif',
            'https://media.tenor.com/Y-q3VWbL6v4AAAAC/roast-burn.gif'
        ];

        let gifBuffer = null;
        for (const url of burnGifs) {
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
                    caption: `🔥 *${botName}*\n\n${finalMessage}`,
                    mentions: mentions
                }, { quoted: fakeSender });
            } catch {
                await sock.sendMessage(chatId, {
                    text: ` ⟮ 🔥 ${botName} ⟯⊷\n *BURN / ROAST*\n\n ${finalMessage}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: fakeSender });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🔥 ${botName} ⟯⊷\n *BURN / ROAST*\n\n ${finalMessage}\n⊷\n\n_⚡ Powered by ${botName}_`,
                mentions: mentions
            }, { quoted: fakeSender });
        }
    }
};