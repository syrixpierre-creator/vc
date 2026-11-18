const { lee } = require('../lee');
const axios = require('axios');
const { fakevCard } = require('../lib/fakevCard');
const { getPrefix } = require('../lib/prefix');
const prefix = getPrefix();

const BASE = "https://www.thesportsdb.com/api/v1/json/3";

lee({
    pattern: "team",
    alias: ["teamsearch", "findteam", "teaminfo", "club"],
    desc: "Search for a sports team/club profile",
    category: "sports",
    react: "🏆",
    use: ".team <name>",
    filename: __filename,
}, async (malvin, mek, m, { from, args, reply }) => {
    const query = args.join(' ').trim();

    if (!query) {
        return reply(`🏆 *Team Search*\n\n📌 *Usage:* ${prefix}team <team name>\n\n📝 *Examples:*\n${prefix}team Real Madrid\n${prefix}team Manchester United\n${prefix}team Lakers`);
    }

    try {
        // Send searching message
        const searchingMsg = await malvin.sendMessage(from, {
            text: '🏆 *Searching for team...* Please wait ⏳',
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: fakevCard });

        // Search for team
        const url = `${BASE}/searchteams.php?t=${encodeURIComponent(query)}`;
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

        const team = response.data?.teams?.[0];
        if (!team) {
            return reply(`❌ No team found for *"${query}"*.\n\nPlease try a different name or check the spelling.`);
        }

        // Format team info
        const teamInfo = [
            "|  TEAM INFO  ",
            "",
            `  *Team*      : ${team.strTeam || '-'}`,
            `  *Sport*     : ${team.strSport || '-'}`,
            `  *League*    : ${team.strLeague || '-'}`,
            `  *Country*   : ${team.strCountry || '-'}`,
            `  *Stadium*   : ${team.strStadium || '-'}`,
            `  *Capacity*  : ${team.intStadiumCapacity || '-'}`,
            `  *Founded*   : ${team.intFormedYear || '-'}`,
            `  *Colours*   : ${team.strColour1 || '-'}${team.strColour2 ? ` / ${team.strColour2}` : ''}`,
            `  *Manager*   : ${team.strManager || '-'}`,
            `  *Website*   : ${team.strWebsite ? `https://${team.strWebsite}` : '-'}`,
            `  *Facebook*  : ${team.strFacebook || '-'}`,
            `  *Twitter*   : ${team.strTwitter || '-'}`,
            `  *Instagram* : ${team.strInstagram || '-'}`,
            `  *Description*: ${(team.strDescriptionEN || team.strDescription || '-').substring(0, 150)}...`,
            "",
            ""
        ].join("\n");

        // Try to send with image if available
        const imageUrl = team.strBadge || team.strLogo || team.strTeamBadge;
        if (imageUrl) {
            try {
                const imgResponse = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 10000
                });

                return await malvin.sendMessage(from, {
                    image: Buffer.from(imgResponse.data),
                    caption: teamInfo,
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
            text: teamInfo,
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: fakevCard });

    } catch (error) {
        console.error('Team search error:', error.message);
        await reply(`❌ Failed to search for team.\n\nPlease try again later.`);
    }
});