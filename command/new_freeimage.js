"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploaders_js_1 = (function(){try{return require("../lib/uploaders");}catch(e){return {};}}());
exports.default = {
    command: 'freeimage',
    aliases: ['fimg', 'freeimg'],
    category: 'upload',
    description: 'Upload to Freeimage.host',
    usage: '.freeimage (reply to image)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg?.imageMessage) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image!' }, { quoted: message });
                return;
            }
            await sock.sendMessage(chatId, { text: 'Uploading to Freeimage...' }, { quoted: message });
            const stream = await (0, baileys_1.downloadContentFromMessage)(quotedMsg.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            const tempDir = path_1.default.join('./temp');
            if (!fs_1.default.existsSync(tempDir))
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            const tempPath = path_1.default.join(tempDir, `freeimage_${Date.now()}.jpg`);
            fs_1.default.writeFileSync(tempPath, buffer);
            const result = await (0, uploaders_js_1.uploadToFreeimage)(tempPath);
            await sock.sendMessage(chatId, {
                text: `✅ *Freeimage Upload Success!*\n\n` +
                    `🔗 *URL:* ${result.url}\n` +
                    `🖼️ *Display:* ${result.display_url}\n` +
                    `🗑️ *Delete:* ${result.delete_url}`
            }, { quoted: message });
            fs_1.default.unlinkSync(tempPath);
        }
        catch (error) {
            console.error('Freeimage Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
        }
    }
};

module.exports = exports.default;
