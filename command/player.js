const { lee } = require('../lee');
const axios = require('axios');
const { fakevCard } = require('../lib/fakevCard');
const { getPrefix } = require('../lib/prefix');
const prefix = getPrefix();

const BASE = "https://www.thesportsdb.com/api/v1/json/3";

// Helper function to get country flag
function getFlag(country) {
    if (!country) return "";
    try {
        return country.toUpperCase().replace(/./g, char =>
            String.fromCodePoint(127397 + char.codePointAt(0))
        );
    } catch {
        return "";
    }
}

lee({
    pattern: "player",
    alias: ["playersearch", "findplayer", "playerinfo"],
    desc: "Search for a sports player profile",
    category: "sports",
    react: "⚽",
    use: ".player <name>",
    filename: __filename,
}, async (malvin, mek, m, { from, args, reply }) => {
    const query = args.join(' ').trim();

    if (!query) {
        return reply(`⚽ *Player Search*\n\n📌 *Usage:* ${prefix}player <player name>\n\n📝 *Examples:*\n${prefix}player Cristiano Ronaldo\n${prefix}player Lionel Messi\n${prefix}player LeBron James`);
    }

    try {
        // Send searching message
        const searchingMsg = await malvin.sendMessage(from, {
            text: '⚽ *Searching for player...* Please wait ⏳',
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: fakevCard });

        // Search for player
        const url = `${BASE}/searchplayers.php?p=${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Delete searching message
        await malvin.sendMessage(from, {
            delete: searchingMsg.key
        });

        const player = response.data?.player?.[0];
        if (!player) {
            return reply(`❌ No player found for *"${query}"*.\n\nPlease try a different name or check the spelling.`);
        }

        // Format player info
        const playerInfo = [
            "|  PLAYER INFO  ",
            "",
            `  *Name*       : ${player.strPlayer || '-'}`,
            `  *Sport*      : ${player.strSport || '-'}`,
            `  *Team*       : ${player.strTeam || '-'}`,
            `  *Nationality*: ${player.strNationality || '-'} ${getFlag(player.strNationality)}`,
            `  *Position*   : ${player.strPosition || '-'}`,
            `  *Height*     : ${player.strHeight || '-'}`,
            `  *Weight*     : ${player.strWeight || '-'}`,
            `  *Born*       : ${player.dateBorn || '-'}`,
            `  *Birthplace* : ${player.strBirthLocation || '-'}`,
            `  *Status*     : ${player.strStatus || '-'}`,
            `  *Gender*     : ${player.strGender || '-'}`,
            "",
            ""
        ].join("\n");

        // Try to send with image if available
        if (player.strThumb) {
            try {
                const imgResponse = await axios.get(player.strThumb, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });

                return await malvin.sendMessage(from, {
                    image: Buffer.from(imgResponse.data),
                    caption: playerInfo,
                    contextInfo: {
                        mentionedJid: [m.sender]
                    }
                }, { quoted: fakevCard });
            } catch {
                // If image fails, send text only
            }
        }

        // Send text only if image fails or not available
        await malvin.sendMessage(from, {
            text: playerInfo,
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: fakevCard });

    } catch (error) {
        console.error('Player search error:', error.message);
        await reply(`❌ Failed to search for player.\n\nPlease try again later.`);
    }
});