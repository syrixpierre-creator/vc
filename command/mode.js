const store = require('../lib/lightweight_store')

/**
 * Advanced bot mode system with multiple access control options
 * Modes:
 * - public: Everyone can use (groups + private)
 * - private: Owner/sudo only
 * - groups: Only works in groups (everyone in groups)
 * - inbox: Only works in private chats (everyone in DM)
 * - self: Owner/sudo only (alias for private)
 */
async function modeCommand(sock, message, args, context) {
    const { chatId, channelInfo } = context

    const senderId = message.key.participant || message.key.remoteJid
    const isOwnerOrSudoCheck = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck

    if (!isOwnerOrSudoCheck) {
        return await sock.sendMessage(chatId, {
            text: '🚫 *You are not authorized to use this command!*'
        }, { quoted: message })
    }

    const subCommand = args[0]?.toLowerCase()
    const currentMode = await store.getBotMode() || 'public'
    const validModes = ['public', 'private', 'groups', 'inbox', 'self']

    if (!subCommand || subCommand === 'status' || subCommand === 'check') {
        return await sock.sendMessage(chatId, {
            text: `✅ *Current mode: ${currentMode}*\n\nAvailable options:\n- public\n- private\n- groups\n- inbox`
        }, { quoted: message })
    }

    if (!validModes.includes(subCommand)) {
        return await sock.sendMessage(chatId, {
            text: '❌ *Invalid option!*\n\nAvailable options:\n- public\n- private\n- groups\n- inbox'
        }, { quoted: message })
    }

    await store.setBotMode(subCommand)
    try {
        // force messageHandler to re-read mode immediately
        const mh = require('../lib/messageHandler');
        if (mh && typeof mh.clearBotModeCache === 'function') mh.clearBotModeCache();
    } catch (_) {}

    await sock.sendMessage(chatId, {
        text: `✅ *Your work type updated to: ${subCommand}*`
    }, { quoted: message })
}

module.exports = {
    command: 'mode',
    aliases: ['botmode', 'setmode'],
    category: 'owner',
    description: 'Advanced bot access control - Set who can use the bot and where',
    usage: '.mode [public|private|groups|inbox|self|status]',
    ownerOnly: true,
    handler: modeCommand
}

