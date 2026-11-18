// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

module.exports = {
    command: 'birthday',
    aliases: ['bday', 'hbd', 'happybirthday'],
    category: 'group',
    description: 'Announce a birthday for a group member',
    usage: '.birthday @user [age]',
    groupOnly: true,
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        // Get mentioned users
        const ctx = message.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctx?.mentionedJid || [];
        const target = mentioned[0] || null;

        // Find age in args
        const age = args.find(a => !isNaN(a) && parseInt(a) > 0 && parseInt(a) < 150);

        // Birthday emojis
        const emojis = ['🎂', '🎉', '🎊', '🥳', '🎁', '🎈', '🎀', '✨', '💫', '🌟', '🎆', '🎇'];
        const randEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

        // Birthday messages
        const birthdayMessages = [
            "Wishing you a fantastic birthday!",
            "May all your wishes come true!",
            "Have an amazing day!",
            "You deserve all the happiness today!",
            "Happy Birthday to an incredible person!",
            "Hope your day is as special as you are!",
            "Celebrating you today!",
            "Here's to another year of greatness!"
        ];
        const randomMsg = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];

        // Build the birthday announcement
        let text;
        let mentions = [];

        if (target) {
            const targetTag = '@' + target.split('@')[0];
            mentions = [target];

            // Random birthday song/pun
            const songMessages = [
                "🎵 Happy Birthday to you! 🎵",
                "🎶 Hip hip hooray! 🎶",
                "🎵 It's your special day! 🎵",
                "🎶 Birthday girl/boy! 🎶"
            ];
            const song = songMessages[Math.floor(Math.random() * songMessages.length)];

            text = ` ⟮ 🎂 ${botName} ⟯⊷
 *HAPPY BIRTHDAY!*

 ${randEmoji()}${randEmoji()}${randEmoji()} *HBD!* ${randEmoji()}${randEmoji()}${randEmoji()}

 🎉 Wishing ${targetTag} a wonderful birthday!${age ? `\n 🎂 Turning *${age}* today!` : ''}

 💬 ${randomMsg}

 ${song}

 ${randEmoji()}${randEmoji()}${randEmoji()} ${randEmoji()}${randEmoji()}${randEmoji()}

 💡 *Tip:* Send a message to wish them!
⊷

_⚡ Powered by ${botName}_`;
        } else {
            // No mention - generic birthday
            const name = args.length ? args.join(' ').toUpperCase() : 'SOMEONE SPECIAL';
            text = ` ⟮ 🎂 ${botName} ⟯⊷
 *HAPPY BIRTHDAY!*

 ${randEmoji()}${randEmoji()}${randEmoji()} *HBD ${name}!* ${randEmoji()}${randEmoji()}${randEmoji()}

 🎉 Wishing you an amazing day filled with joy!

 💬 ${randomMsg}

 ${randEmoji()}${randEmoji()}${randEmoji()} ${randEmoji()}${randEmoji()}${randEmoji()}

 💡 *Tip:* Mention someone with .birthday @user
⊷

_⚡ Powered by ${botName}_`;
        }

        await sock.sendMessage(chatId, {
            text: text,
            mentions: mentions
        }, { quoted: fakeSender });
    }
};