const store = require('../lib/lightweight_store')
const xpLib = require('../lib/xpSystem')

/**
 * Increment message count for a user in a chat
 * Now uses the unified store system (backward compatible)
 */
async function incrementMessageCount(chatId, userId) {
    try {
        await store.incrementMessageCount(chatId, userId)
    } catch (error) {
        console.error('Error incrementing message count:', error)
    }
}

/**
 * Load all message counts (backward compatible)
 * Returns same format as old JSON file
 */
async function loadMessageCounts() {
    try {
        const data = await store.getAllMessageCounts()
        return data.messageCount || {}
    } catch (error) {
        console.error('Error loading message counts:', error)
        return {}
    }
}

/**
 * Save message counts (backward compatible, but now a no-op)
 * Data is auto-saved by the store system
 */
function saveMessageCounts(messageCounts) {
    console.log('[RANK] saveMessageCounts called (no-op - auto-saved by store)')
}

module.exports = {
    command: 'rank',
    aliases: ['top', 'topusers', 'leaderboard', 'ranks'],
    category: 'group',
    description: 'Show top 5 most active members based on message count (.leaderboard = XP leaderboard)',
    usage: '.rank | .top | .leaderboard',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid

        // .leaderboard → XP leaderboard (lib/xpSystem.js). .rank/.top/.ranks →
        // message-count leaderboard (neeche). Dono alag systems hain.
        const invoked = String((context && (context.rawText || context.userMessage)) || message.body || '').replace(/^\./, '').split(/\s+/)[0].toLowerCase();
        if (invoked === 'leaderboard') {
            try {
                const board = xpLib.leaderboard(10);
                if (!board.length) {
                    await sock.sendMessage(chatId, { text: '🏆 *XP Leaderboard*\n\nAbhi kisi ke paas XP nahi hai. Message bhejo aur XP kamao!' }, { quoted: message });
                    return;
                }
                const medals = ['🥇', '🥈', '🥉'];
                const lines = board.map((e, i) =>
                    (medals[i] || (i + 1) + '.') + ' @' + String(e.num).split('@')[0] + ' — Lvl ' + e.level + ' • ' + Number(e.xp).toLocaleString('en-IN') + ' XP');
                await sock.sendMessage(chatId, {
                    text: '🏆 *XP Leaderboard (Top 10)*\n\n' + lines.join('\n'),
                    mentions: board.map((e) => e.num + '@s.whatsapp.net')
                }, { quoted: message });
            } catch (error) {
                console.error('Leaderboard XP Error:', error);
                await sock.sendMessage(chatId, { text: '❌ Failed to load XP leaderboard. Please try again later.' }, { quoted: message });
            }
            return;
        }

        try {
            const messageCounts = await loadMessageCounts()
            const groupCounts = messageCounts[chatId] || {}

            const sortedMembers = Object.entries(groupCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)

            if (sortedMembers.length === 0) {
                await sock.sendMessage(chatId, {
                    text: '📊 *No message activity recorded yet*\n\nStart chatting to appear on the leaderboard!'
                }, { quoted: message })
                return
            }

            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
            let messageText = '🏆 *TOP MEMBERS LEADERBOARD*\n\n'

            sortedMembers.forEach(([userId, count], index) => {
                const username = userId.split('@')[0]
                messageText += `${medals[index]} @${username}\n💬 ${count} messages\n\n`
            })

            messageText += '_Keep chatting to climb the ranks!_'

            await sock.sendMessage(chatId, {
                text: messageText,
                mentions: sortedMembers.map(([userId]) => userId)
            }, { quoted: message })

        } catch (error) {
            console.error('Rank Command Error:', error)
            await sock.sendMessage(chatId, {
                text: '❌ Failed to load leaderboard. Please try again later.'
            }, { quoted: message })
        }
    },

    incrementMessageCount,
    loadMessageCounts,
    saveMessageCounts
}


/*
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    }
    return {};
}

function saveMessageCounts(messageCounts) {
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();

    if (!messageCounts[groupId]) {
        messageCounts[groupId] = {};
    }

    if (!messageCounts[groupId][userId]) {
        messageCounts[groupId][userId] = 0;
    }

    messageCounts[groupId][userId] += 1;

    saveMessageCounts(messageCounts);
}

module.exports = {
    command: 'rank',
    aliases: ['top', 'topusers', 'leaderboard', 'ranks'],
    category: 'group',
    description: 'Show top 5 most active members based on message count',
    usage: '.rank',
    groupOnly: true,

    async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;

        const messageCounts = loadMessageCounts();
        const groupCounts = messageCounts[chatId] || {};

        const sortedMembers = Object.entries(groupCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        if (sortedMembers.length === 0) {
            await sock.sendMessage(chatId, {
                text: '📊 *No message activity recorded yet*\n\nStart chatting to appear on the leaderboard!'
            }, { quoted: message });
            return;
        }

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        let messageText = '🏆 *TOP MEMBERS LEADERBOARD*\n\n';

        sortedMembers.forEach(([userId, count], index) => {
            const username = userId.split('@')[0];
            messageText += `${medals[index]} @${username}\n💬 ${count} messages\n\n`;
        });

        messageText += '_Keep chatting to climb the ranks!_';

        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: sortedMembers.map(([userId]) => userId)
        }, { quoted: message });
    },

    incrementMessageCount,
    loadMessageCounts,
    saveMessageCounts
};
*/

