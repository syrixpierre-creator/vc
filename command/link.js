const settings = require('../settings');
module.exports = async (sock, m) => {
    const chatId = m.key.remoteJid;

    // 1. Check if the command is used in a group
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: "❌ *Error:* This command can only be used in groups!"
        }, { quoted: m });
    }

    try {
        // 2. Fetch the group invite code and group profile picture
        const code = await sock.groupInviteCode(chatId);
        const groupLink = `https://chat.whatsapp.com/${code}`;

        // Try to get group profile picture, fallback to a default if it fails or has no photo
        let groupProfilePic;
        try {
            groupProfilePic = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            groupProfilePic = null; // pas de photo → miniature du bot
        }

        const response = ` *QUEEN AKUMA GROUP LINK*
 🔗 *Invite Link:* ${groupLink}
 🤖 *Bot:* QUEEN AKUMA
`;

        // 3. Send the link with the real group profile picture
        await sock.sendMessage(chatId, {
            text: response,
            contextInfo: {
                externalAdReply: {
                    title: "GROUP INVITATION",
                    body: "Click to join this group",
                    ...(groupProfilePic ? { thumbnailUrl: groupProfilePic } : { thumbnail: require('../lib/botImage').botThumbBuffer() }),
                    sourceUrl: groupLink,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (err) {
        console.error("Group Link Error:", err);
        await sock.sendMessage(chatId, {
            text: "⚠️ *Permission Denied:* I cannot fetch the link. Make sure I am a **Group Admin**!"
        }, { quoted: m });
    }
};
