/**
 * Gayrate Command - Playful gay percentage
 * Reply or mention a user to get their gay rating
 */

module.exports = {
    command: 'gayrate',
    aliases: ['gay', 'gaypercentage', 'howgay'],
    category: 'fun',
    description: 'Playful gay percentage. Reply or mention a user.',
    usage: '.gayrate (reply or @user)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;

        try {
            // Get mentioned user or reply target
            const ctx = message.message?.extendedTextMessage?.contextInfo || {};
            const mentioned = ctx.mentionedJid || [];
            let targetId = null;
            let targetName = 'User';

            // Check for mentioned user
            if (mentioned.length > 0) {
                targetId = mentioned[0];
            }
            // Check for replied user
            else if (ctx.participant) {
                targetId = ctx.participant;
            }
            // Check if args has a mention
            else if (args.length > 0) {
                const arg = args[0];
                if (arg.includes('@')) {
                    // Extract number from mention
                    const match = arg.match(/@(\d+)/);
                    if (match) {
                        targetId = `${match[1]}@s.whatsapp.net`;
                    }
                }
            }

            // If still no target, use the sender
            if (!targetId) {
                targetId = message.key?.participant || message.key?.remoteJid;
            }

            // Get target name if possible
            try {
                if (targetId) {
                    const contact = await sock.contactQuery(targetId);
                    if (contact) targetName = contact.name || contact.notify || targetId.split('@')[0];
                }
            } catch (e) {
                targetName = targetId?.split('@')[0] || 'User';
            }

            const targetTag = `@${targetId?.split('@')[0] || 'user'}`;

            // Generate deterministic but random percentage based on ID
            const idString = targetId?.toString() || 'unknown';
            let base = 0;
            for (let i = 0; i < idString.length; i++) {
                base += idString.charCodeAt(i);
            }

            // Add random factor but keep it somewhat consistent
            const randomFactor = Math.floor((base * Date.now() / 100000) % 13);
            let percent = ((base % 89) + randomFactor + 10) % 101;

            // Make it more interesting with some random variation
            const seed = Math.floor(Math.random() * 10);
            if (seed > 7) percent = Math.min(100, percent + 10);
            if (seed < 3) percent = Math.max(0, percent - 5);

            // Create response messages
            const messages = [
                `🌈 ${targetTag} is **${percent}%** fabulous! 🏳️‍🌈`,
                `💖 ${targetTag} is **${percent}%** rainbow compatible! ✨`,
                `🏳️‍🌈 ${targetTag} scores **${percent}%** pure glitter! 🎉`,
                `✨ ${targetTag} is **${percent}%** ready to slay! 💅`,
                `🌈 ${targetTag} is **${percent}%** gay! Rock it! 🎊`
            ];

            // Add special messages for high/low scores
            let specialMessage = '';
            if (percent >= 95) {
                specialMessage = '\n🌟 *ULTIMATE RAINBOW LEGEND!* 🌟';
            } else if (percent >= 80) {
                specialMessage = '\n🏳️‍🌈 *Certified Rainbow Royalty!* 👑';
            } else if (percent >= 60) {
                specialMessage = '\n✨ *Looking fabulous!* 💅';
            } else if (percent >= 40) {
                specialMessage = '\n🌈 *Enjoying the rainbow vibes!* 🎨';
            } else if (percent >= 20) {
                specialMessage = '\n🌟 *A rainbow in the making!* 🌱';
            } else if (percent < 10) {
                specialMessage = '\n🤷‍♀️ *Still fabulous though!* 💫';
            }

            // Select random message
            const response = messages[Math.floor(Math.random() * messages.length)];

            await sock.sendMessage(chatId, {
                text: `${response}${specialMessage}`,
                mentions: [targetId]
            }, { quoted: message });

        } catch (error) {
            console.error('[Gayrate] ERROR:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *Something went wrong.* Please try again.'
            }, { quoted: message });
        }
    }
};