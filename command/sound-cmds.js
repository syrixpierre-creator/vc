/* QUEEN AKUMA legacy plugin (family B) — converted automatically */
const { cmd } = require('../lib/compat').registrar;

for (let i = 1; i <= 161; i++) {

    cmd({
        pattern: `sound${i}`,
        alias: [],
        desc: `Play sound number ${i}`,
        category: "media",
        react: "🎵",
        filename: __filename
    },

    async (conn, mek, m, { from, reply, command }) => {
        try {
            // Extract number from command (sound7 → 7)
            const num = command.replace("sound", "");

            // TikTok Music
            const url = `https://github.com/iTx-Sarkar/Sounds/raw/master/tiktokmusic/sound${num}.mp3`;

            await conn.sendMessage(
                from,
                {
                    audio: { url },
                    mimetype: "audio/mpeg",
                    ptt: false,

                    contextInfo: {
                        externalAdReply: {
                            title: "QUEEN AKUMA",
                            body: "QUEEN AKUMA Audio Collection",
                            thumbnail: require('../lib/botImage').botThumbBuffer(),
                            mediaType: 1,
                            renderLargerThumbnail: true,
                            showAdAttribution: true,
                            sourceUrl: "https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA"
                        }
                    }
                },
                { quoted: mek }
            );

        } catch (e) {
            console.error(e);
            reply("⚠ Error playing sound.");
        }
    });
}
