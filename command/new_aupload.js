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
    command: 'aupload',
    aliases: ['upall', 'aup', 'toall'],
    category: 'upload',
    description: 'Upload media to cloud and get URL',
    usage: '.aupload (reply to image/video/gif/sticker)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: '⚠️ Please reply to an image, video, GIF, or sticker!' }, { quoted: message });
                return;
            }
            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: '⚠️ Unsupported file type! Reply to image/video/gif/sticker/document' }, { quoted: message });
                return;
            }
            await sock.sendMessage(chatId, { text: 'Uploading to cloud...' }, { quoted: message });
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
            else if (type === 'documentMessage') {
                const fileName = quotedMsg[type].fileName || 'file';
                ext = fileName.split('.').pop() || 'bin';
            }
            const tempDir = path_1.default.join('./temp');
            if (!fs_1.default.existsSync(tempDir))
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            const tempPath = path_1.default.join(tempDir, `upload_${Date.now()}.${ext}`);
            fs_1.default.writeFileSync(tempPath, buffer);
            const stats = fs_1.default.statSync(tempPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            const result = await (0, uploaders_js_1.uploadFile)(tempPath);
            await sock.sendMessage(chatId, {
                text: `✅ *Upload Successful!*\n\n` +
                    `📊 *Service:* ${result.service}\n` +
                    `📦 *Size:* ${fileSizeMB} MB\n` +
                    `🔗 *URL:* ${result.url}\n\n` +
                    `_Click the link to view/download_`
            }, { quoted: message });
            fs_1.default.unlinkSync(tempPath);
        }
        catch (error) {
            console.error('Upload Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Upload failed!\n\nError: ${error.message}`
            }, { quoted: message });
        }
    }
};

module.exports = exports.default;
