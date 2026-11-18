"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
exports.default = {
    command: 'punch',
    aliases: ['hit', 'smack'],
    category: 'fun',
    description: 'Punch someone with an anime GIF 👊',
    usage: '.punch [@mention or reply to message]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        try {
            await sock.sendMessage(chatId, {
                react: { text: '👊', key: message.key }
            }).catch(() => { });
            const sender = message.key.participant || message.key.remoteJid;
            const senderTag = '@' + sender.split('@')[0];
            let target = null;
            const ctx = message.message?.extendedTextMessage?.contextInfo;
            if (ctx?.mentionedJid?.length) {
                target = ctx.mentionedJid[0];
            }
            else if (ctx?.participant) {
                target = ctx.participant;
            }
            else if (args.length) {
                const digits = args[0].replace(/[^0-9]/g, '');
                if (digits)
                    target = digits + '@s.whatsapp.net';
            }
            let caption;
            let mentions = [sender];
            if (target && target !== sender) {
                const targetTag = '@' + target.split('@')[0];
                const messages = [
                    `👊 *PUNCH!*\n\n${senderTag} punched ${targetTag}! 💥`,
                    `👊 *FIGHT!*\n\n${senderTag} landed a punch on ${targetTag}! 👊`,
                    `👊 *SMACK!*\n\n${senderTag} smacked ${targetTag}! 💢`
                ];
                caption = messages[Math.floor(Math.random() * messages.length)];
                mentions = [sender, target];
            }
            else {
                const selfMessages = [
                    `👊 *PUNCH!*\n\n${senderTag} threw a punch at the air! 💥`,
                    `👊 *FIGHT!*\n\n${senderTag} is shadowboxing! 👊`,
                    `👊 *SMACK!*\n\n${senderTag} is practicing their punches! 💢`
                ];
                caption = selfMessages[Math.floor(Math.random() * selfMessages.length)];
            }
            const gifs = [
                'https://media.giphy.com/media/xT0BKiwiVJq5B0XhHG/giphy.gif',
                'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
                'https://media.tenor.com/8n7JQYvZ8ScAAAAC/anime-punch.gif'
            ];
            let gifBuffer = null;
            for (const url of gifs) {
                try {
                    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        if (buffer.byteLength > 100) {
                            gifBuffer = Buffer.from(buffer);
                            break;
                        }
                    }
                }
                catch {
                    continue;
                }
            }
            if (gifBuffer) {
                try {
                    await sock.sendMessage(chatId, {
                        video: gifBuffer,
                        gifPlayback: true,
                        mimetype: 'video/mp4',
                        caption: caption,
                        mentions: mentions
                    }, { quoted: messageConfig_js_1.fakeSender });
                }
                catch {
                    await sock.sendMessage(chatId, {
                        image: gifBuffer,
                        mimetype: 'image/gif',
                        caption: caption,
                        mentions: mentions
                    }, { quoted: messageConfig_js_1.fakeSender });
                }
            }
            else {
                await sock.sendMessage(chatId, {
                    text: ` ⟮ 👊 ${botName} ⟯⊷\n *PUNCH*\n\n ${caption}\n⊷\n\n_⚡ Powered by ${botName}_`,
                    mentions: mentions
                }, { quoted: messageConfig_js_1.fakeSender });
            }
            await sock.sendMessage(chatId, {
                react: { text: '✅', key: message.key }
            }).catch(() => { });
        }
        catch (error) {
            console.error('Punch error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message || 'Failed to send punch'}`
            }, { quoted: messageConfig_js_1.fakeSender });
        }
    }
};

module.exports = exports.default;
