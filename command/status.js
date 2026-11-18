const toBold = (text) => {
    const boldChars = {
        'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h', 'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z',
        'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z',
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

async function statusCommand(sock, from, msg, isAdmin, botData, saveBotData, userId, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "❌ Only owner can use this command." }, { quoted: msg });

    if (!botData.statusSettings[userId]) {
        botData.statusSettings[userId] = {
            autoStatus: false,
            autoSeen: false,
            autoLike: false,
            autoDownload: false,
            system: 1,
            isPublic: false
        };
    }

    const action = args[0]?.toLowerCase();

    if (!action) {
        const settings = botData.statusSettings[userId];
        const menu = ` ${toBold("STATUS SETTINGS")} ⊷\n` +
                   ` ⋄ ${toBold("Auto Status:")} ${settings.autoStatus ? '✅' : '❌'}\n` +
                   ` ⋄ ${toBold("Auto Seen:")} ${settings.autoSeen ? '✅' : '❌'}\n` +
                   ` ⋄ ${toBold("Auto Like:")} ${settings.autoLike ? '✅' : '❌'}\n` +
                   ` ⋄ ${toBold("Auto Download:")} ${settings.autoDownload ? '✅' : '❌'}\n` +
                   ` ⋄ ${toBold("Current System:")} ${settings.system || 1}\n` +
                   `⊷\n\n` +
                   `*Commands:*\n` +
                   `.status on/off - Toggle All\n` +
                   `.status seen on/off\n` +
                   `.status like on/off\n` +
                   `.status download on/off\n` +
                   `.status system 1/2/3`;
        return await sock.sendMessage(from, { text: menu }, { quoted: msg });
    }

    if (action === 'on') {
        botData.statusSettings[userId].autoStatus = true;
        botData.statusSettings[userId].autoSeen = true;
        botData.statusSettings[userId].autoLike = true;
        botData.statusSettings[userId].autoDownload = true;
        saveBotData();
        await sock.sendMessage(from, { text: "✅ *ALL STATUS FEATURES: ON*" }, { quoted: msg });
    } else if (action === 'off') {
        botData.statusSettings[userId].autoStatus = false;
        botData.statusSettings[userId].autoSeen = false;
        botData.statusSettings[userId].autoLike = false;
        botData.statusSettings[userId].autoDownload = false;
        saveBotData();
        await sock.sendMessage(from, { text: "❌ *ALL STATUS FEATURES: OFF*" }, { quoted: msg });
    } else if (action === 'seen') {
        const val = args[1]?.toLowerCase();
        if (val === 'on') {
            botData.statusSettings[userId].autoSeen = true;
            botData.statusSettings[userId].autoStatus = true;
            saveBotData();
            await sock.sendMessage(from, { text: "✅ *Auto Seen: ON*" }, { quoted: msg });
        } else if (val === 'off') {
            botData.statusSettings[userId].autoSeen = false;
            saveBotData();
            await sock.sendMessage(from, { text: "❌ *Auto Seen: OFF*" }, { quoted: msg });
        }
    } else if (action === 'like') {
        const val = args[1]?.toLowerCase();
        if (val === 'on') {
            botData.statusSettings[userId].autoLike = true;
            botData.statusSettings[userId].autoStatus = true;
            saveBotData();
            await sock.sendMessage(from, { text: "✅ *Auto Like: ON*" }, { quoted: msg });
        } else if (val === 'off') {
            botData.statusSettings[userId].autoLike = false;
            saveBotData();
            await sock.sendMessage(from, { text: "❌ *Auto Like: OFF*" }, { quoted: msg });
        }
    } else if (action === 'download') {
        const val = args[1]?.toLowerCase();
        if (val === 'on') {
            botData.statusSettings[userId].autoDownload = true;
            botData.statusSettings[userId].autoStatus = true;
            saveBotData();
            await sock.sendMessage(from, { text: "✅ *Auto Download: ON*" }, { quoted: msg });
        } else if (val === 'off') {
            botData.statusSettings[userId].autoDownload = false;
            saveBotData();
            await sock.sendMessage(from, { text: "❌ *Auto Download: OFF*" }, { quoted: msg });
        }
    } else if (action === 'system') {
        const sys = parseInt(args[1]);
        if ([1, 2, 3].includes(sys)) {
            botData.statusSettings[userId].system = sys;
            saveBotData();
            await sock.sendMessage(from, { text: `✅ *OS System set to: ${sys}*` }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: "❌ Choose system 1, 2, or 3." }, { quoted: msg });
        }
    }
}

module.exports = statusCommand;
