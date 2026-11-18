"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
exports.default = {
    command: 'base',
    aliases: ['baseconvert', 'convbase'],
    category: 'utility',
    description: 'Convert number between bases (2-36)',
    usage: '.base <number> <fromBase> <toBase>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        const [n, fb, tb] = args;
        const f = parseInt(fb);
        const t = parseInt(tb);
        // Validate inputs
        if (!n || isNaN(f) || isNaN(t) || f < 2 || f > 36 || t < 2 || t > 36) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🔢 ${botName} ⟯⊷
 *BASE CONVERTER*

 *Usage:*
 .base <number> <fromBase> <toBase>

 *Example:*
 .base FF 16 10
 .base 1010 2 16

 *Supported bases:* 2 - 36
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        // Convert
        const value = parseInt(n, f);
        if (isNaN(value)) {
            await sock.sendMessage(chatId, {
                text: `❌ Invalid number "${n}" for base ${f}\n\nSupported digits: 0-9, A-Z`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const result = value.toString(t).toUpperCase();
        await sock.sendMessage(chatId, {
            text: ` ⟮ 🔢 ${botName} ⟯⊷
 *BASE CONVERTER*

 🔁 ${n} (base ${f})
 ➡️ *${result}* (base ${t})

 📊 Decimal: ${value}
 📌 Base ${f}: ${n}
 📌 Base ${t}: ${result}
⊷

_⚡ Powered by ${botName}_`
        }, { quoted: messageConfig_js_1.fakeSender });
    }
};

module.exports = exports.default;
