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
    command: 'litterbox',
    aliases: ['tempup', 'litter', 'litr'],
    category: 'upload',
    description: 'Upload temporarily (1h/12h/24h/72h)',
    usage: '.litterbox <1h/12h/24h/72h> (reply to media)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to media!' }, { quoted: message });
                return;
            }
            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported type!' }, { quoted: message });
                return;
            }
            const time = args[0] || '1h';
            const validTimes = ['1h', '12h', '24h', '72h'];
            const uploadTime = validTimes.includes(time) ? time : '1h';
            await sock.sendMessage(chatId, { text: `Uploading to Litterbox (${uploadTime})...` }, { quoted: message });
            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await (0, baileys_1.downloadContentFromMessage)(quotedMsg[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let ext = 'bin';
            if (type === 'imageMessage')
                ext = 'jpg';
            else if (type === 'videoMessage')
                ext = 'mp4';
            else if (type === 'stickerMessage')
                ext = 'webp';
            else if (quotedMsg[type].fileName) {
                ext = quotedMsg[type].fileName.split('.').pop() || 'bin';
            }
            const tempDir = path_1.default.join('./temp');
            if (!fs_1.default.existsSync(tempDir))
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            const tempPath = path_1.default.join(tempDir, `litterbox_${Date.now()}.${ext}`);
            fs_1.default.writeFileSync(tempPath, buffer);
            const result = await (0, uploaders_js_1.uploadToLitterbox)(tempPath, uploadTime);
            await sock.sendMessage(chatId, {
                text: `✅ *Litterbox Upload Success!*\n\n` +
                    `⏰ *Expires:* ${result.expires}\n` +
                    `🔗 *URL:* ${result.url}\n\n` +
                    `_Link will expire after ${result.expires}_`
            }, { quoted: message });
            fs_1.default.unlinkSync(tempPath);
        }
        catch (error) {
            console.error('Litterbox Error:', error);
            await sock.sendMessage(chatId, { text: `❌ Error: ${error.message}` }, { quoted: message });
        }
    }
};

module.exports = exports.default;
