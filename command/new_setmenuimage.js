"use strict";
/**
 * SetMenuImage Command - Owner only
 * Set/change the menu image by replying to an image or sticker
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_js_1 = __importDefault(require("../settings"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const baileys_1 = require("@whiskeysockets/baileys");
exports.default = {
    command: 'setmenuimage',
    aliases: ['setmenuimg', 'changemenuimage', 'setthumb'],
    category: 'owner',
    description: 'Set or change the menu image (reply to image/sticker)',
    usage: '.setmenuimage (reply to image/sticker)',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            // Check if message is a reply
            const ctx = message.message?.extendedTextMessage?.contextInfo;
            if (!ctx?.quotedMessage) {
                return sock.sendMessage(chatId, {
                    text: '📷 *Please reply to an image or sticker* to set it as the menu image.\n\n' +
                        `📌 *Usage:* Reply to an image/sticker with: ${config_js_1.default.prefixes[0]}setmenuimage`
                }, { quoted: message });
            }
            const quotedMsg = ctx.quotedMessage;
            const imageMsg = quotedMsg.imageMessage || quotedMsg.stickerMessage;
            if (!imageMsg) {
                return sock.sendMessage(chatId, {
                    text: '❌ The replied message must be an *image* or *sticker*.'
                }, { quoted: message });
            }
            // Download the media
            const targetMessage = {
                key: {
                    remoteJid: chatId,
                    id: ctx.stanzaId,
                    participant: ctx.participant,
                },
                message: quotedMsg,
            };
            // Show loading status
            await sock.sendMessage(chatId, {
                text: '⏳ *Downloading image...*'
            }, { quoted: message });
            const mediaBuffer = await (0, baileys_1.downloadMediaMessage)(targetMessage, 'buffer', {}, {
                logger: undefined,
                reuploadRequest: sock.updateMediaMessage
            });
            if (!mediaBuffer) {
                return sock.sendMessage(chatId, {
                    text: '❌ Failed to download the image. Please try again.'
                }, { quoted: message });
            }
            // Convert to JPEG if needed
            let finalBuffer = mediaBuffer;
            try {
                const sharp = await Promise.resolve().then(() => __importStar(require('sharp')));
                if (quotedMsg.stickerMessage) {
                    // Convert sticker (webp) to JPEG
                    finalBuffer = await sharp.default(mediaBuffer)
                        .jpeg({ quality: 90 })
                        .toBuffer();
                }
                else if (imageMsg.mimetype && !imageMsg.mimetype.includes('jpeg') && !imageMsg.mimetype.includes('jpg')) {
                    // Convert other formats to JPEG
                    finalBuffer = await sharp.default(mediaBuffer)
                        .jpeg({ quality: 90 })
                        .toBuffer();
                }
            }
            catch (sharpError) {
                // If sharp is not available, use the buffer as is
                console.warn('Sharp not available, using raw buffer:', sharpError.message);
            }
            // Save to assets/thumb.png
            const imagePath = path_1.default.join(process.cwd(), 'assets', 'bot_image.jpg');
            try { fs_1.default.unlinkSync(path_1.default.join(process.cwd(), 'assets', 'bot_thumb.jpg')); } catch (_) {}
            const assetsDir = path_1.default.join(process.cwd(), 'assets');
            // Create assets directory if it doesn't exist
            if (!fs_1.default.existsSync(assetsDir)) {
                fs_1.default.mkdirSync(assetsDir, { recursive: true });
            }
            // Delete old image if exists
            if (fs_1.default.existsSync(imagePath)) {
                try {
                    fs_1.default.unlinkSync(imagePath);
                }
                catch (e) {
                    console.warn('Could not delete old menu image:', e);
                }
            }
            // Write new image
            fs_1.default.writeFileSync(imagePath, finalBuffer);
            // Send success message with preview
            await sock.sendMessage(chatId, {
                image: { url: imagePath },
                caption: '✅ *Menu image updated successfully!*\n\n' +
                    '📸 New menu image is now active.\n' +
                    '📌 Use *menu* command to see the new image.'
            }, { quoted: message });
        }
        catch (error) {
            console.error('SetMenuImage command error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to set menu image: ${error.message}`
            }, { quoted: message });
        }
    }
};

module.exports = exports.default;
