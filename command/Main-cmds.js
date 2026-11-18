const { bandah, commands } = require("../command");
const config = require("../config");
const moment = require("moment-timezone");
const os = require("os");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const { exec } = require("child_process");
const { runtime } = require('../lib/functions');

// ============================================================
// PERSISTENT UPTIME TRACKING - NEVER RESETS
// ============================================================
const START_FILE = path.join(__dirname, "../data/start-time.json");
let botStartTime;

try {
    if (fs.existsSync(START_FILE)) {
        const data = JSON.parse(fs.readFileSync(START_FILE, "utf8"));
        botStartTime = data.startTime || Date.now();
    } else {
        botStartTime = Date.now();
        fs.mkdirSync(path.dirname(START_FILE), { recursive: true });
        fs.writeFileSync(
            START_FILE,
            JSON.stringify({ startTime: botStartTime }, null, 2)
        );
    }
} catch (e) {
    botStartTime = Date.now();
}

// Save uptime before any restart
function saveUptime() {
    try {
        fs.writeFileSync(
            START_FILE,
            JSON.stringify({ startTime: botStartTime }, null, 2)
        );
    } catch (e) {}
}

// ============================================================
// CONSTANTS
// ============================================================
const ALIVE_IMG = require('../lib/botImage').BOT_IMAGE;
const OWNER_PATH = path.join(__dirname, "../assets/sudo.json");
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

// ============================================================
// COMMAND EMOJIS - UNIQUE EMOJI FOR EACH COMMAND
// ============================================================
const commandEmojis = {
    'alive': '🕋',
    'alive2': '⚡',
    'ping': '🏓',
    'up': '⏱️',
    'uptime': '⏱️',
    'menu': '📋',
    'allmenu': '📚',
    'repo': '📂',
    'tutorial': '📘',
    'gpass': '🔐',
    'owner': '👑',
    'list': '📃',
    'update': '🔄',
    'restart': '🔄',
    'toolsmenu': '🛠️',
    'mainmenu': '🏠',
    'bugmenu': '🐛',
    'downloadmenu': '📥',
    'randommenu': '🎲',
    'funmenu': '🎉',
    'ownermenu': '👑',
    'groupmenu': '👥',
    'searchmenu': '🔍',
    'convertermenu': '🔄',
    'islamicmenu': '🕌',
    'aimenu': '🤖'
};

function getCommandEmoji(pattern) {
    if (!pattern) return '⬡';
    const cmd = pattern.split(' ')[0].toLowerCase();
    return commandEmojis[cmd] || '⬡';
}

// ============================================================
// FONT SYSTEM
// ============================================================
let fontCounter = 0;
const fontStyles = ['bold', 'monospace', 'italic', 'bold-italic'];
const fontMaps = {
    'bold': {
        a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j', k: 'k', l: 'l',
        m: 'm', n: 'n', o: 'o', p: 'p', q: 'q', r: 'r', s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'x',
        y: 'y', z: 'z', A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H', I: 'I', J: 'J',
        K: 'K', L: 'L', M: 'M', N: 'N', O: 'O', P: 'P', Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'U', V: 'V',
        W: 'W', X: 'X', Y: 'Y', Z: 'Z', "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7",
        "8": "8", "9": "9", "0": "0"
    },
    'monospace': {
        a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j', k: 'k', l: 'l',
        m: 'm', n: 'n', o: 'o', p: 'p', q: 'q', r: 'r', s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'x',
        y: 'y', z: 'z', A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H', I: 'I', J: 'J',
        K: 'K', L: 'L', M: 'M', N: 'N', O: 'O', P: 'P', Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'U', V: 'V',
        W: 'W', X: 'X', Y: 'Y', Z: 'Z', "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7",
        "8": "8", "9": "9", "0": "0"
    },
    'italic': {
        a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j', k: 'k', l: 'l',
        m: 'm', n: 'n', o: 'o', p: 'p', q: 'q', r: 'r', s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'x',
        y: 'y', z: 'z', A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H', I: 'I', J: 'J',
        K: 'K', L: 'L', M: 'M', N: 'N', O: 'O', P: 'P', Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'U', V: 'V',
        W: 'W', X: 'X', Y: 'Y', Z: 'Z'
    },
    'bold-italic': {
        a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j', k: 'k', l: 'l',
        m: 'm', n: 'n', o: 'o', p: 'p', q: 'q', r: 'r', s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'x',
        y: 'y', z: 'z', A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H', I: 'I', J: 'J',
        K: 'K', L: 'L', M: 'M', N: 'N', O: 'O', P: 'P', Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'U', V: 'V',
        W: 'W', X: 'X', Y: 'Y', Z: 'Z'
    }
};

function getNextFont() {
    const font = fontStyles[fontCounter % fontStyles.length];
    fontCounter++;
    return font;
}

function convertText(txt, fontStyle) {
    if (!txt || typeof txt !== 'string') return '';
    const map = fontMaps[fontStyle] || fontMaps.bold;
    return txt.split('').map(c => map[c] || c).join('');
}

function fancy(txt) {
    const currentFont = fontStyles[(fontCounter - 1) % fontStyles.length];
    return convertText(txt, currentFont);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getLiveUptime() {
    const runtimeMs = Date.now() - botStartTime;
    const days = Math.floor(runtimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((runtimeMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((runtimeMs / (1000 * 60)) % 60);
    const seconds = Math.floor((runtimeMs / 1000) % 60);
    return { days, hours, minutes, seconds, runtimeMs };
}

function getPakistanTime() {
    return moment().tz("Asia/Karachi");
}

function formatUptime() {
    const { days, hours, minutes, seconds } = getLiveUptime();
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatDate() {
    return getPakistanTime().format("DD MMM YYYY");
}

function formatTime() {
    return getPakistanTime().format("hh:mm:ss A");
}

function getCommandDisplay(commandPattern) {
    if (!commandPattern) return '';
    if (config.PREFIX === 'null') {
        return commandPattern;
    }
    return `${config.PREFIX}${commandPattern}`;
}

async function getBotVersion() {
    try {
        if (!config.REPO) return 'QUEEN AKUMA';
        const repoUrl = config.REPO;
        const rawUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/package.json';
        const { data } = await axios.get(rawUrl);
        return data.version || "QUEEN AKUMA";
    } catch (error) {
        console.error("Version check error:", error);
        return 'QUEEN AKUMA';
    }
}

function createDJObject(m, customName = null) {
    return {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: 'status@broadcast'
        },
        message: {
            contactMessage: {
                displayName: customName || config.BOT_NAME,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${config.BOT_NAME};;;\nFN:${config.BOT_NAME}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:QUEEN AKUMA\nEND:VCARD`
            }
        }
    };
}

function generateCategorySection(categoryName, commandsList) {
    if (!commandsList || !commandsList.length) return '';
    const currentFont = fontStyles[(fontCounter - 1) % fontStyles.length];
    let section = `*💙 ${convertText(categoryName.toUpperCase(), currentFont)} 💚*\n\n···\n`;
    commandsList.forEach(cmd => {
        if (cmd.pattern) {
            const commandDisplay = getCommandDisplay(cmd.pattern);
            const emoji = getCommandEmoji(cmd.pattern);
            section += `** *${emoji} ${convertText(commandDisplay, currentFont)}*\n`;
        }
    });
    section += `···\n\n`;
    return section;
}

// ============================================================
// ALIVE COMMAND - WITH LIVE UPTIME
// ============================================================
bandah({
    pattern: "alive",
    alias: ["live"],
    desc: "Alive status with live uptime",
    category: "main",
    react: "🕋",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const uptime = formatUptime();
        const date = formatDate();
        const time = formatTime();
        const audioUrl = "https://bandaheali-cdn.koyeb.app/bandaheali/alive.mp3";
        const thumbUrl = ALIVE_IMG;

        await conn.sendMessage(
            from,
            {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363403408693274@newsletter",
                        newsletterName: "QUEEN AKUMA",
                        serverMessageId: 143
                    },
                    externalAdReply: {
                        title: "🕋 QUEEN AKUMA IS ONLINE",
                        body: `⚡ ${uptime}`,
                        mediaType: 1,
                        thumbnail: require('../lib/botImage').botThumbBuffer(),
                        sourceUrl: "https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA",
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error("❌ Alive cmd error:", err);
    }
});

// ============================================================
// PING COMMAND - REAL SPEED + LIVE UPTIME
// ============================================================
bandah({
    pattern: "ping",
    alias: ["speed", "pong"],
    use: '.ping',
    desc: "Check bot's real response time",
    category: "main",
    react: "🏓",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        // Real response time measurement
        const start = Date.now();

        // Send initial reaction
        try {
            await conn.sendMessage(from, {
                react: { text: "⏳", key: mek.key }
            });
        } catch (_) {}

        // Calculate real response time
        const end = Date.now();
        const responseTime = end - start;

        // Live uptime
        const uptime = formatUptime();
        const date = formatDate();
        const time = formatTime();

        // Memory usage
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);

        // Stylish text response
        const text = `

    🏓 PING / SPEED


    📡 Response: ${responseTime}ms
    🕐 Uptime: ${uptime}
    📅 Date: ${date}
    ⏰ Time: ${time}
    💾 RAM: ${memoryUsed}MB/${totalMemory}MB
    🟢 Status: ONLINE

    📢 Join Our Channel
    https://whatsapp.com/
    channel/0029Vawbj7e5k
    g7AFF5MuZ28

    > POWERED BY QUEEN AKUMA
`;

        // Send response
        await conn.sendMessage(from, {
            text: text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403408693274@newsletter',
                    newsletterName: "QUEEN AKUMA",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Final reaction
        try {
            const reactionEmojis = ['🔥', '⚡', '🚀', '💨'];
            const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
            await conn.sendMessage(from, {
                react: { text: reactionEmoji, key: mek.key }
            });
        } catch (_) {}

    } catch (e) {
        console.error("❌ Ping command error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ============================================================
// UPTIME COMMAND - LIVE DETAILED UPTIME
// ============================================================
bandah({
    pattern: "up",
    alias: ["uptime"],
    use: ".up",
    desc: "Show bot live uptime",
    category: "system",
    react: "⏱️",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        try { await m.react("⏳"); } catch (_) {}

        const { days, hours, minutes, seconds } = getLiveUptime();
        const date = formatDate();
        const time = formatTime();

        const uptimeMsg = `🤖 *QUEEN AKUMA*

⚡ *LIVE UPTIME INFO*

📅 Days : ${days}
🕐 Hours : ${hours}
⏰ Minutes : ${minutes}
⏱️ Seconds : ${seconds}

📅 Date : ${date}
⏰ Time : ${time}

🟢 STATUS: ONLINE

> POWERED BY QUEEN AKUMA`;

        await conn.sendMessage(m.chat, {
            image: { url: ALIVE_IMG },
            caption: uptimeMsg,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403408693274@newsletter',
                    newsletterName: 'QUEEN AKUMA',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        try { await m.react("✅"); } catch (_) {}

    } catch (e) {
        console.error("❌ UP command error:", e);
        await reply("❌ *QUEEN AKUMA*: Uptime information temporarily unavailable.");
    }
});

// ============================================================
// MAIN MENU COMMAND - FULLY STYLISH WITH AUDIO
// ============================================================
bandah({
    pattern: "menu",
    desc: "QUEEN AKUMA stylish menu with audio",
    alias: ["help", "commands"],
    category: "main",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendPresenceUpdate('composing', from);

        const currentFont = getNextFont();
        const version = await getBotVersion();
        const totalCommands = commands.filter(bandah => bandah.pattern).length;
        const ownername = config.OWNER_NAME;
        const uptime = formatUptime();
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
        const audioUrl = "https://bandaheali-cdn.koyeb.app/bandaheali/alive.mp3";

        const ai = {
            key: {
                remoteJid: "status@broadcast",
                fromMe: false,
                participant: "13135550002@s.whatsapp.net"
            },
            message: {
                contactMessage: {
                    displayName: "QUEEN AKUMA",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta AI\nTEL;type=CELL;type=VOICE;waid=13135550002:+1 3135550002\nEND:VCARD`
                }
            }
        };

        const validCommands = commands.filter(bandah =>
            bandah.pattern &&
            bandah.category &&
            bandah.category.toLowerCase() !== 'menu' &&
            !bandah.hideCommand
        );

        const categories = {};
        validCommands.forEach(bandah => {
            const category = bandah.category.toLowerCase();
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(bandah);
        });

        let menuSections = '';
        Object.entries(categories)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([category, cmds]) => {
                let section = `*💙 ${convertText(category.toUpperCase(), currentFont)} 💚*\n\n···\n`;
                cmds.forEach(cmd => {
                    if (cmd.pattern) {
                        const commandDisplay = getCommandDisplay(cmd.pattern);
                        const emoji = getCommandEmoji(cmd.pattern);
                        section += `** *${emoji} ${convertText(commandDisplay, currentFont)}*\n`;
                    }
                });
                section += `···\n\n`;
                menuSections += section;
            });

        let dec = `

    ${convertText(config.BOT_NAME, currentFont)}


    👑 Owner: ${ownername} (🇵🇰)
    ⚙️ Mode: ${config.MODE}
    📌 Prefix: ${config.PREFIX}
    💾 RAM: ${memoryUsed}MB/${totalMemory}MB
    📦 Version: ${version}
    🕐 Uptime: ${uptime}
    📊 Commands: ${totalCommands}

    > ${convertText('QUEEN AKUMA - THE BEST', currentFont)}


${readMore}

${menuSections}


    📌 Use ${config.PREFIX}menu for full menu
    🎨 Font: ${currentFont.toUpperCase()}
    > POWERED BY QUEEN AKUMA

`;

        // Send menu with image
        await conn.sendMessage(
            from,
            {
                image: { url: ALIVE_IMG },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403408693274@newsletter',
                        newsletterName: convertText('QUEEN AKUMA', currentFont),
                        serverMessageId: 143
                    }
                }
            },
            { quoted: ai }
        );

        // Send audio (same as alive)
        await conn.sendMessage(
            from,
            {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403408693274@newsletter',
                        newsletterName: convertText('QUEEN AKUMA', currentFont),
                        serverMessageId: 143
                    }
                }
            },
            { quoted: ai }
        );

        await conn.sendPresenceUpdate('paused', from);

    } catch (e) {
        console.error('Menu Error:', e);
        reply(`❌ Error generating menu: ${e.message}`);
    }
});

// ============================================================
// ALLMENU COMMAND - STYLISH WITH 4 COMMANDS PER SECTION
// ============================================================
bandah({
    pattern: "allmenu",
    react: "📚",
    alias: ["allcommands", "fullmenu", "cmdlist"],
    desc: "Get complete stylish command list",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        await conn.sendPresenceUpdate('composing', from);

        const currentFont = getNextFont();
        const version = await getBotVersion();
        const ownername = config.OWNER_NAME || "QUEEN AKUMA";
        const uptime = formatUptime();
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
        const totalCommands = commands.filter(bandah => bandah.pattern).length;

        // Get category filter if provided
        const filterCategory = args[0] ? args[0].toLowerCase() : null;

        // Filter valid commands
        const validCommands = commands.filter(bandah =>
            bandah.pattern &&
            bandah.category &&
            !bandah.hideCommand
        );

        // Group by category
        const categories = {};
        validCommands.forEach(bandah => {
            const category = bandah.category.toLowerCase();
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(bandah);
        });

        // If specific category requested
        if (filterCategory && categories[filterCategory]) {
            const cmds = categories[filterCategory];
            let menu = `

    📚 ${convertText(filterCategory.toUpperCase(), currentFont)}


    👑 Owner: ${ownername}
    📌 Prefix: ${config.PREFIX}
    📊 Commands: ${cmds.length}
    🕐 Uptime: ${uptime}


${readMore}

`;

            // Display commands in 4 per section
            const chunkSize = 4;
            for (let i = 0; i < cmds.length; i += chunkSize) {
                const chunk = cmds.slice(i, i + chunkSize);

                menu += `\n`;
                menu += `   ${convertText('COMMANDS', currentFont)} ${i + 1}-${Math.min(i + chunkSize, cmds.length)}  \n`;
                menu += `\n`;

                chunk.forEach(cmd => {
                    const commandDisplay = getCommandDisplay(cmd.pattern);
                    const emoji = getCommandEmoji(cmd.pattern);
                    const desc = cmd.desc || '';
                    menu += `  ${emoji} ${convertText(commandDisplay, currentFont)}\n`;
                    if (desc) {
                        const descShort = desc.length > 35 ? desc.substring(0, 32) + '...' : desc;
                        menu += `     ${descShort}\n`;
                    }
                });

                menu += `\n\n`;
            }

            menu += `

    📌 Use ${config.PREFIX}allmenu for full list
    > POWERED BY QUEEN AKUMA

`;

            await conn.sendMessage(from, {
                image: { url: ALIVE_IMG },
                caption: menu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403408693274@newsletter',
                        newsletterName: 'QUEEN AKUMA',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });

            await conn.sendPresenceUpdate('paused', from);
            return;
        }

        // Build full menu with categories - 4 commands per section
        let fullMenu = `

    📚 ${convertText('QUEEN AKUMA COMMANDS', currentFont)}


    👑 Owner: ${ownername}
    ⚙️ Mode: ${config.MODE}
    📌 Prefix: ${config.PREFIX}
    💾 RAM: ${memoryUsed}MB/${totalMemory}MB
    📦 Version: ${version}
    🕐 Uptime: ${uptime}
    📊 Total: ${totalCommands}


${readMore}

`;

        // Add each category with commands in 4 per section
        const sortedCategories = Object.keys(categories).sort();
        for (const category of sortedCategories) {
            const cmds = categories[category];
            const catFont = getNextFont();

            // Category header
            fullMenu += `\n`;
            fullMenu += `    💠 ${convertText(category.toUpperCase(), catFont)} 💠    \n`;
            fullMenu += `    📊 ${cmds.length} commands             \n`;
            fullMenu += `\n\n`;

            // Display commands in groups of 4
            const chunkSize = 4;
            for (let i = 0; i < cmds.length; i += chunkSize) {
                const chunk = cmds.slice(i, i + chunkSize);

                fullMenu += `\n`;
                fullMenu += `   ${convertText('COMMANDS', catFont)} ${i + 1}-${Math.min(i + chunkSize, cmds.length)}  \n`;
                fullMenu += `\n`;

                chunk.forEach(cmd => {
                    if (cmd.pattern) {
                        const commandDisplay = getCommandDisplay(cmd.pattern);
                        const emoji = getCommandEmoji(cmd.pattern);
                        const desc = cmd.desc || '';
                        fullMenu += `  ${emoji} ${convertText(commandDisplay, catFont)}\n`;
                        if (desc) {
                            const descShort = desc.length > 35 ? desc.substring(0, 32) + '...' : desc;
                            fullMenu += `     ${descShort}\n`;
                        }
                    }
                });

                fullMenu += `\n\n`;
            }

            // Add separator between categories
            fullMenu += `\n\n`;
        }

        // Footer
        fullMenu += `

    📌 ${convertText('Use .allmenu [category]', currentFont)}
    ${convertText('Example: .allmenu main', currentFont)}
    > POWERED BY QUEEN AKUMA

`;

        // Send the menu
        await conn.sendMessage(from, {
            image: { url: ALIVE_IMG },
            caption: fullMenu,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403408693274@newsletter',
                    newsletterName: 'QUEEN AKUMA',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        await conn.sendPresenceUpdate('paused', from);

    } catch (e) {
        console.error('AllMenu Error:', e);
        reply(`❌ Error generating allmenu: ${e.message}`);
    }
});

// ============================================================
// ALIVE2 COMMAND - WITH AUDIO
// ============================================================
bandah({
    pattern: "alive2",
    alias: ["status2", "online2"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const voiceClips = [
            "https://cdn.ironman.my.id/i/7p5plg.mp4",
            "https://cdn.ironman.my.id/i/l4dyvg.mp4",
            "https://cdn.ironman.my.id/i/4z93dg.mp4",
            "https://cdn.ironman.my.id/i/m9gwk0.mp4",
            "https://cdn.ironman.my.id/i/gr1jjc.mp4",
            "https://cdn.ironman.my.id/i/lbr8of.mp4",
            "https://cdn.ironman.my.id/i/0z95mz.mp4",
            "https://cdn.ironman.my.id/i/rldpwy.mp4",
            "https://cdn.ironman.my.id/i/lz2z87.mp4",
            "https://cdn.ironman.my.id/i/gg5jct.mp4",
            "https://cdn.ironman.my.id/i/0gup65.mp4",
            "https://cdn.ironman.my.id/i/8mrocq.mp4",
            "https://cdn.ironman.my.id/i/xf29k2.mp4",
            "https://cdn.ironman.my.id/i/aof4z4.mp4",
            "https://cdn.ironman.my.id/i/1ulm61.mp4",
            "https://cdn.ironman.my.id/i/88x93o.mp4",
            "https://files.catbox.moe/bat4dt.mp3",
            "https://files.catbox.moe/nugg7o.mp3",
            "https://files.catbox.moe/fcqzmk.mp3",
            "https://files.catbox.moe/tqzlfl.mp3",
            "https://files.catbox.moe/w94n86.mp3",
            "https://files.catbox.moe/cuk967.mp3",
            "https://files.catbox.moe/7ajubx.mp3",
            "https://files.catbox.moe/2fi10f.mp3",
            "https://files.catbox.moe/78isfb.mp3",
            "https://files.catbox.moe/lcrt4a.mp3"
        ];
        const rClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

        const thumbnailBuffer = require('../lib/botImage').botThumbBuffer();

        await conn.sendMessage(from, {
            audio: { url: rClip },
            mimetype: 'audio/mp4',
            ptt: false,
            waveform: [99, 0, 99, 0, 99],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: `${config.BOT_NAME} IS ONLINE`,
                    body: `${config.DESCRIPTION}`,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    thumbnail: thumbnailBuffer,
                    sourceUrl: "https://wa.me/message/TEWHI2YV6JZKI1",
                    showAdAttribution: true
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363403408693274@newsletter",
                    newsletterName: "QUEEN AKUMA",
                    serverMessageId: 143
                }
            }
        }, { quoted: createDJObject(m, "QUEEN AKUMA") });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// ============================================================
// REPO COMMAND
// ============================================================
bandah({
    pattern: "repo",
    alias: ["sc", "script"],
    desc: "Fetch repository information",
    react: "📂",
    category: "main",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA';

    try {
        const match = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            return reply("❌ Invalid GitHub repository URL.");
        }

        const [, username, repoName] = match;

        const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}`);
        const repoData = response.data;

        const formattedInfo = `\`\`\`🛠️ REPOSITORY INFORMATION

📁 BOT NAME: ${repoData.name}
👤 OWNER NAME: ${repoData.owner.login}
⭐ STARS: ${repoData.stargazers_count}
💚 FORKS: ${repoData.forks_count}
🌐 GITHUB LINK: ${repoData.html_url}
📝 DESCRIPTION: ${repoData.description || 'No description provided'}

✨ DON'T FORGET TO STAR AND FORK THE REPOSITORY!

© POWERED BY QUEEN AKUMA\`\`\``;

        await conn.sendMessage(from, {
            image: { url: ALIVE_IMG },
            caption: formattedInfo,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403408693274@newsletter',
                    newsletterName: 'QUEEN AKUMA',
                    serverMessageId: 143
                }
            }
        }, { quoted: createDJObject(m) });

    } catch (error) {
        console.error("Error in repo command:", error);
        reply(`❌ Repo cmd error: ${error.message}`);
    }
});

// ============================================================
// TUTORIAL COMMAND
// ============================================================
bandah({
    pattern: "tutorial",
    alias: ["deploy", "howtodeploy"],
    desc: "Complete QUEEN AKUMA deployment tutorial",
    category: "main",
    react: "📘",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const caption = `\`\`\`📘 QUEEN AKUMA DEPLOYMENT TUTORIAL

Follow these steps to deploy QUEEN AKUMA properly 👇

1️⃣ WATCH VIDEO TUTORIAL
🎥 https://youtu.be/d50-E6D9VK4?si=9rm8r1BW3NUMBj6l

2️⃣ FORK THE REPO
🔗 https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA/fork

3️⃣ GET YOUR SESSION (PAIR CODE)
💠 https://classique-moliere-78387-3aadd828798e.herokuapp.com/

4️⃣ DEPLOY THE BOT ON VPS
🖥️ https://vps.bandaheali.site

⚡ After following these steps, your QUEEN AKUMA Bot will be fully ready and online.

POWERED BY QUEEN AKUMA SYSTEM ⚙️
\`\`\``;

        await conn.sendMessage(
            from,
            {
                image: { url: ALIVE_IMG },
                caption,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363403408693274@newsletter",
                        newsletterName: "QUEEN AKUMA",
                        serverMessageId: 144
                    }
                }
            },
            { quoted: createDJObject(m) }
        );

    } catch (err) {
        await reply(`\`\`\`❌ Tutorial cmd error: ${err.message}\`\`\``);
    }
});

// ============================================================
// PASSWORD GENERATOR
// ============================================================
bandah({
    pattern: "gpass",
    desc: "Generate a strong password",
    category: "main",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const length = args[0] ? parseInt(args[0]) : 12;
        if (isNaN(length) || length < 8) {
            return reply('Please provide a valid length for the password (Minimum 08 Characters).');
        }

        const generatePassword = (len) => {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
            let password = '';
            for (let i = 0; i < len; i++) {
                const randomIndex = crypto.randomInt(0, charset.length);
                password += charset[randomIndex];
            }
            return password;
        };

        const password = generatePassword(length);
        const message = `🔐 *Your Strong Password* 🔐\n\nPlease find your generated password below`;

        await conn.sendMessage(from, { text: message }, { quoted: mek });
        await conn.sendMessage(from, { text: password }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error generating password: ${e.message}`);
    }
});

// ============================================================
// OWNER COMMAND
// ============================================================
bandah({
    pattern: "owner",
    react: "👑",
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const ownerNumber = '+92 321 3231887';
        const ownerNumber2 = '+92 316 2942778';
        const ownerName = 'QUEEN AKUMA';

        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace(/\s+/g, '').replace('+', '')}:${ownerNumber}\n` +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber2.replace(/\s+/g, '').replace('+', '')}:${ownerNumber2}\n` +
                      'END:VCARD';

        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        });

        await conn.sendMessage(from, {
            image: { url: ALIVE_IMG },
            caption: ` *QUEEN AKUMA* ⊷
·
• *Here Is The Owner Details*
• *Name* - ${ownerName}
• *Number 1* ${ownerNumber}
• *Number 2* ${ownerNumber2}
• *Version*: 5.0.0 Beta
⊷
⊷
> © POWERED BY QUEEN AKUMA`,
            contextInfo: {
                mentionedJid: [
                    `${ownerNumber.replace('+', '')}@s.whatsapp.net`,
                    `${ownerNumber2.replace('+', '')}@s.whatsapp.net`
                ],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403408693274@newsletter',
                    newsletterName: 'QUEEN AKUMA',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply(`An error occurred: ${error.message}`);
    }
});

// ============================================================
// CATEGORY MENUS - DYNAMIC GENERATION WITH EMOJIS
// ============================================================
function createCategoryMenu(category, categoryDisplayName) {
    bandah({
        pattern: `${category}menu`,
        desc: `Show ${categoryDisplayName} commands`,
        alias: [`${category}help`, `${category}commands`],
        category: "main",
        react: "📁",
        filename: __filename
    }, async (conn, mek, m, { from, reply }) => {
        try {
            await conn.sendPresenceUpdate('composing', from);

            const version = await getBotVersion();
            const ownername = config.OWNER_NAME;

            const categoryCommands = commands.filter(bandah =>
                bandah.pattern &&
                bandah.category &&
                bandah.category.toLowerCase() === category.toLowerCase() &&
                !bandah.hideCommand
            );

            if (categoryCommands.length === 0) {
                return reply(`❌ No commands found in *${categoryDisplayName}* category.`);
            }

            const metaIconBuffer = require('../lib/botImage').botThumbBuffer();

            const fake = {
                key: {
                    remoteJid: "status@broadcast",
                    fromMe: false,
                    id: "ABCD1234",
                    participant: "0@s.whatsapp.net"
                },
                message: {
                    contactMessage: {
                        displayName: "QUEEN AKUMA",
                        vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Meta AI\nTEL;type=CELL:+13135550002\nEND:VCARD",
                        jpegThumbnail: metaIconBuffer
                    }
                }
            };

            let menuContent = `
       \`\`\`${categoryDisplayName.toUpperCase()} MENU\`\`\`


▧ *OWNER* : *${ownername} (🇵🇰)*
▧ *MODE* : *${config.MODE}*
▧ *PREFIX* : *${config.PREFIX}*
▧ *VERSION* : *${version}*
▧ *CATEGORY* : *${categoryDisplayName}*
▧ *COMMANDS* : ${categoryCommands.length}


> ${categoryDisplayName.toUpperCase()} - COMMANDS


${readMore}

${generateCategorySection(categoryDisplayName, categoryCommands)}

**⁠⁠⁠⁠
> Use *${config.PREFIX}menu* for full menu
**
`;

            await conn.sendMessage(
                from,
                {
                    image: { url: ALIVE_IMG },
                    caption: menuContent,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363403408693274@newsletter',
                            newsletterName: `QUEEN AKUMA ${categoryDisplayName.toUpperCase()}`,
                            serverMessageId: 143
                        }
                    }
                },
                { quoted: fake }
            );

            await conn.sendPresenceUpdate('paused', from);

        } catch (e) {
            console.error(`${category} Menu Error:`, e);
            reply(`❌ Error generating ${categoryDisplayName} menu: ${e.message}`);
        }
    });
}

// Create category menus
createCategoryMenu("tools", "Tools");
createCategoryMenu("main", "Main");
createCategoryMenu("bug", "Bug");
createCategoryMenu("download", "Download");
createCategoryMenu("random", "Random");
createCategoryMenu("fun", "Fun");
createCategoryMenu("owner", "Owner");
createCategoryMenu("group", "Group");
createCategoryMenu("search", "Search");
createCategoryMenu("converter", "Converter");
createCategoryMenu("islamic", "Islamic");
createCategoryMenu("ai", "AI");

// ============================================================
// LIST COMMAND
// ============================================================
bandah({
    pattern: "list",
    alias: ["listmenu", "alllist"],
    use: '.menu',
    desc: "Show all bot commands",
    category: "main",
    react: "📃",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const totalCommands = commands.length;
        const date = formatDate();
        const uptime = formatUptime();

        let menuText = `
* ${config.BOT_NAME} ⊷*
*❂*
*❂ Owner:* ${config.OWNER_NAME}
*❂ Baileys:* MULTI DEVICE
*❂ Date:* ${date}
*❂ Uptime:* ${uptime}
*❂ Prefix:* ${config.PREFIX}
*❂ Mode:* ${config.MODE}
*❂ Ram:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
*❂ Total Commands:* ${totalCommands}
*❂ Status:* *ONLINE*
*❂ Version:* 1.0.0
*❂*
*⊷*
`;

        let category = {};
        for (let bandah of commands) {
            if (!bandah.category) continue;
            if (!category[bandah.category]) category[bandah.category] = [];
            category[bandah.category].push(bandah);
        }

        const keys = Object.keys(category).sort();
        for (let k of keys) {
            menuText += `\n\n*❂ ${k.toUpperCase()} ❂*`;
            const cmds = category[k].filter(c => c.pattern).sort((a, b) => a.pattern.localeCompare(b.pattern));
            cmds.forEach((bandah) => {
                const commandDisplay = getCommandDisplay(bandah.pattern);
                const emoji = getCommandEmoji(bandah.pattern);
                menuText += `\n*${emoji} ${commandDisplay}*    `;
            });
            menuText += `\n**`;
        }

        await conn.sendMessage(from, {
            image: { url: ALIVE_IMG },
            caption: menuText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403408693274@newsletter',
                    newsletterName: 'QUEEN AKUMA',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
});

// ============================================================
// UPDATE COMMAND
// ============================================================
bandah({
    pattern: "update",
    alias: ["updbot", "botupdate"],
    desc: "Real bot update from GitHub",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, from }) => {
    if (!isOwner) return reply("🚫 *You are not authorized to use this command!*!");

    const date = formatDate();
    const time = formatTime();

    await conn.sendMessage(from, {
        image: { url: ALIVE_IMG },
        caption: `🔍 Updating...\n📅 ${date}\n⏰ ${time}`
    }, { quoted: mek });

    try {
        const repoUrl = config.REPO || "https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA";
        const zipUrl = `${repoUrl}/archive/refs/heads/main.zip`;
        const tmpZip = path.join(os.tmpdir(), "queen_update.zip");
        const tmpExtract = path.join(os.tmpdir(), "queen_update");

        if (fs.existsSync(tmpZip)) fs.unlinkSync(tmpZip);
        if (fs.existsSync(tmpExtract)) fs.rmSync(tmpExtract, { recursive: true, force: true });

        const response = await axios({ method: 'GET', url: zipUrl, responseType: 'stream' });
        const writer = fs.createWriteStream(tmpZip);
        response.data.pipe(writer);
        await new Promise((r,j)=>{writer.on('finish',r);writer.on('error',j);});
        await new Promise((r,j)=>{exec(`mkdir -p ${tmpExtract} && unzip -o ${tmpZip} -d ${tmpExtract}`, e=> e?j(e):r());});

        const sourceFolder = path.join(tmpExtract, fs.readdirSync(tmpExtract)[0]);
        const skipFiles = ['node_modules','.git','config.env','.env','session'];
        const copy = (s,d)=>{fs.readdirSync(s).forEach(i=>{if(skipFiles.includes(i))return;const a=path.join(s,i),b=path.join(d,i);fs.statSync(a).isDirectory()? (fs.existsSync(b)||fs.mkdirSync(b,{recursive:true}),copy(a,b)) : fs.copyFileSync(a,b);});};
        copy(sourceFolder, process.cwd());

        fs.unlinkSync(tmpZip);
        fs.rmSync(tmpExtract, { recursive: true, force: true });

        saveUptime(); // Save uptime before restart

        await conn.sendMessage(from, {
            image: { url: ALIVE_IMG },
            caption: `✅ UPDATE SUCCESS!\n📅 ${date}\n⏰ ${time}\n⚡ Restarting...`
        }, { quoted: mek });

        setTimeout(()=>process.exit(0),5000);
    } catch(e){
        exec("git pull", async(err,out)=>{
            await conn.sendMessage(from, {
                image: { url: ALIVE_IMG },
                caption: err?`❌ ${e.message}`:`✅ Updated via Git!\n${out.slice(0,300)}`
            }, { quoted: mek });
            if(!err) {
                saveUptime();
                setTimeout(()=>process.exit(0),5000);
            }
        });
    }
});

// ============================================================
// RESTART COMMAND
// ============================================================
bandah({
    pattern: "restart",
    desc: "Restart the bot",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("❌ Only owner can restart the bot.");

    await reply("🔄 Restarting...");
    saveUptime(); // Save uptime before restart
    process.exit(0);
});

// ============================================================
// EXPORT
// ============================================================
module.exports = {
    saveUptime,
    getLiveUptime,
    formatUptime,
    formatDate,
    formatTime
};
