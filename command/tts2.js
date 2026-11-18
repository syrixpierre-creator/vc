const axios = require('axios');
const config = require('../settings');
const { sam, commands } = require('../sam');
const googleTTS = require('google-tts-api');
const { fakevCard } = require('../lib/fakevCard');
sam({
    pattern: "say",
    desc: "download songs",
    category: "download",
    react: "👧",
    filename: __filename
}, async (sam, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q)
            return reply("Need some text.");
        const url = googleTTS.getAudioUrl(q, {
            lang: 'hi-IN',
            slow: false,
            host: 'https://translate.google.com',
        });
        await sam.sendMessage(from, { audio: { url: url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: fakevCard });
    }
    catch (a) {
        reply(`${a}`);
    }
});
