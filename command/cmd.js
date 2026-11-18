const { sam } = require('../sam');
const config = require('../settings');
const { fakevCard } = require('../lib/fakevCard');
sam({
    pattern: "list",
    alias: ["listcmd", "commands"],
    desc: "Show bot command menu",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (malvin, mek, m, { from, reply }) => {
    try {
        const dec = `
 ⚡ DOWNLOAD CMD ⚡
 • .play      - Download audio from YouTube
 • .song      - Download song from YouTube
 • .apk       - Download APK from Play Store
 • .video     - Download video from YouTube
 • .facebook  - Download video from Facebook
 • .tiktok      - Download video from TikTok
 • .instagram  - Download video from Instagram
 • .gdrive    - Download files from Google Drive
 • .twitter   - Download video from Twitter
 • .img       - Download image
 • .drama     - Download full episode video
 • .play2     - Download audio (alt)
 • .video2    - Download video (alt)
 • .mfire     - Download MediaFire files


 🌸 ANIME CMD 🌸
 • .yts        - Search YouTube videos
 • .dog        - Random dog images
 • .anime      - Anime pictures
 • .animegirl  - Anime girl pictures
 • .loli       - Romantic anime pics


 ℹ️ INFO CMD ℹ️
 • .alive      - Check if bot is online
 • .ping       - Check bot speed
 • .menu       - Show main menu
 • .menu2      - Alternate menu
 • .ai          - Chat with AI bot
 • .settings     - Bot system status
 • .owner      - Owner info
 • .status     - Bot runtime info
 • .about      - About this bot
 • .list       - Show command list
 • .repo     - Bot repository link


 🎲 OTHER CMD 🎲
 • .joke         - Random joke
 • .fact         - Random fact
 • .githubstalk  - GitHub user info
 • .gpass        - Generate strong password
 • .hack         - Prank friends
 • .srepo        - Search repos
 • .define       - Search word meanings


 👥 GROUP CMD 👥
 • .warn        - warn users
 • .mute      - mute group
 • .left        - Bot leaves group
 • .remove      - Remove member
 • .add         - Add member
 • .kick        - Kick user
 • .kickall     - Remove all members
 • .promote     - Make admin
 • .demote      - Remove admin
 • .tagall      - Mention all
 • .goodbye  - Leave message
 • .welcome  - Welcome message
 • .ginfo       - Group info


 👑 OWNER CMD 👑
 • .update    - Update bot version
 • .restart   - Restart bot
 • .settings  - View settings
 • .block     - Block user
 • .unblock   - Unblock user
 • .shutdown  - Shutdown bot
 • .setpp     - Update profile pic


 🔄 CONVERT CMD 🔄
 • .sticker  - Photo to sticker
 • .tts      - Text to speech
 • .trt      - Change bot language


${config.DESCRIPTION}
        `.trim();
        await malvin.sendMessage(from, {
            image: { url: require('../lib/botImage').BOT_IMAGE },
            caption: dec,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER_JID || '120363406476499117@newsletter',
                    newsletterName: 'QUEEN AKUMA',
                    serverMessageId: 143
                }
            }
        }, { quoted: fakevCard });
    }
    catch (e) {
        console.error(e);
        reply(`❌ An error occurred: ${e.message || e}`);
    }
});
