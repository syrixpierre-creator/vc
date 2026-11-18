"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
exports.default = {
    command: 'speak',
    aliases: ['voice', 'tts'],
    category: 'general',
    description: 'Convert text to voice (Google TTS)',
    usage: '.speak <text>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        const text = args.join(' ').trim();
        if (!text) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🔊 ${botName} ⟯⊷
 *TEXT TO SPEECH*

 *Usage:*
 .speak <text>

 *Example:*
 .speak Hello, how are you?
 .speak Welcome to QUEEN AKUMA
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        try {
            // Send reaction
            await sock.sendMessage(chatId, {
                react: { text: '🔊', key: message.key }
            }).catch(() => { });
            // Generate TTS audio
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (!response.ok) {
                throw new Error(`TTS request failed with status ${response.status}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            // Send the audio
            await sock.sendMessage(chatId, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: 'voice.mp3',
                caption: `🔊 *Text to Speech*\n\n"${text}"`
            }, { quoted: messageConfig_js_1.fakeSender });
        }
        catch (error) {
            console.error('TTS Error:', error.message);
            await sock.sendMessage(chatId, {
                text: `❌ TTS failed: ${error.message}`
            }, { quoted: messageConfig_js_1.fakeSender });
        }
    }
};

module.exports = exports.default;
