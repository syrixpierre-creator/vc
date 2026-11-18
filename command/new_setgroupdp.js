"use strict";
/**
 * Set Group Profile Picture Command - Change the group icon
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_js_1 = __importDefault(require("../settings"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const baileys_1 = require("@whiskeysockets/baileys");
exports.default = {
    command: 'setgroupdp',
    aliases: ['setgcdp', 'groupicon', 'setgpic', 'gcdp', 'updategcdp', 'setgrouppic'],
    category: 'admin',
    description: 'Change the group profile picture',
    usage: '.setgroupdp (reply to an image)',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            // Check if group
            if (!chatId.endsWith('@g.us')) {
                return sock.sendMessage(chatId, {
                    text: '❌ This command can only be used in *groups*.'
                }, { quoted: message });
            }
            // Check if replying to an image
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                return sock.sendMessage(chatId, {
                    text: `📸 *Please reply to an image* to set as group profile picture.\n\n` +
                        `📌 *Usage:* Reply to an image with: ${config_js_1.default.prefixes[0]}setgroupdp`
                }, { quoted: message });
            }
            // Get the image message
            let imageMessage = quotedMsg.imageMessage ||
                quotedMsg.stickerMessage?.imageMessage ||
                quotedMsg.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
            if (!imageMessage) {
                return sock.sendMessage(chatId, {
                    text: '❌ Please reply to an *image* message to set as group profile picture.'
                }, { quoted: message });
            }
            // Send processing message
            await sock.sendMessage(chatId, {
                text: '⏳ *Downloading image and updating group profile picture...*'
            }, { quoted: message });
            // Download the image
            let buffer = Buffer.from([]);
            try {
                const stream = await (0, baileys_1.downloadContentFromMessage)(imageMessage, 'image');
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
            }
            catch (downloadError) {
                console.error('Download error:', downloadError);
                return sock.sendMessage(chatId, {
                    text: '❌ *Failed to download the image.* Please try again with a different image.'
                }, { quoted: message });
            }
            if (!buffer || buffer.length === 0) {
                return sock.sendMessage(chatId, {
                    text: '❌ *Failed to download the image.* Please try again.'
                }, { quoted: message });
            }
            // Create temp directory if it doesn't exist
            const tempDir = path_1.default.join(process.cwd(), 'temp');
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            // Save temporary file
            const tempPath = path_1.default.join(tempDir, `grouppic_${Date.now()}.jpg`);
            fs_1.default.writeFileSync(tempPath, buffer);
            try {
                // Update group profile picture
                await sock.updateProfilePicture(chatId, { url: tempPath });
                // Clean up temp file
                fs_1.default.unlinkSync(tempPath);
                // Send success message with preview
                await sock.sendMessage(chatId, {
                    image: { url: tempPath },
                    caption: `✅ *Group Profile Picture Updated!* 📸

🆕 Group icon has been successfully changed.

📌 *Command:* ${config_js_1.default.prefixes[0]}setgroupdp
👤 *Admin:* ${message.pushName || 'Admin'}

_Note: The new profile picture may take a few moments to update for all members._`
                }, { quoted: message });
                // Delete the temp file after sending
                setTimeout(() => {
                    try {
                        fs_1.default.unlinkSync(tempPath);
                    }
                    catch (e) { }
                }, 5000);
            }
            catch (updateError) {
                // Clean up temp file on error
                try {
                    fs_1.default.unlinkSync(tempPath);
                }
                catch (e) { }
                if (updateError.message?.includes('not-authorized')) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *I need to be an admin* to change the group profile picture.\n\n' +
                            'Please make me an admin and try again.'
                    }, { quoted: message });
                }
                else if (updateError.message?.includes('429')) {
                    await sock.sendMessage(chatId, {
                        text: '⏳ *Too many requests!*\n\n' +
                            'Please wait a moment and try again.\n' +
                            'WhatsApp limits how often you can change the group picture.'
                    }, { quoted: message });
                }
                else if (updateError.message?.includes('image')) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *Invalid image format.*\n\n' +
                            'Please send a valid image (JPEG, PNG, etc.)'
                    }, { quoted: message });
                }
                else {
                    await sock.sendMessage(chatId, {
                        text: `❌ *Failed to update group profile picture*\n\nError: ${updateError.message}`
                    }, { quoted: message });
                }
            }
        }
        catch (error) {
            console.error('Set Group DP error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *Error:* ${error.message}`
            }, { quoted: message });
        }
    }
};

module.exports = exports.default;
