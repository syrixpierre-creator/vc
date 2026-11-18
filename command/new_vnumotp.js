"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
const vnum_js_1 = (function(){try{return require("../lib/vnum");}catch(e){return {};}}());
exports.default = {
    command: 'vnumotp',
    aliases: ['otp', 'vnummsg', 'getotp', 'sms'],
    category: 'utility',
    description: 'Read SMS / OTP for a virtual number',
    usage: '.vnumotp <number>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        const raw = args.join(' ').trim();
        if (!raw) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 📞 ${botName} ⟯⊷
 *READ SMS / OTP*

 *Usage:*
 .vnumotp <number>

 *Example:*
 .vnumotp 1234567890

 *Run .vnumget to find numbers first.*
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        // Strip +, spaces, dashes, parens
        const number = raw.replace(/[^\d]/g, '');
        if (number.length < 6) {
            await sock.sendMessage(chatId, {
                text: '⚠️ That doesn\'t look like a phone number. Try a full number from *.vnumget*.'
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        let json;
        try {
            json = await (0, vnum_js_1.fetchVnum)('sms24-messages', { number });
        }
        catch (err) {
            await sock.sendMessage(chatId, {
                text: (0, vnum_js_1.friendlyError)(err)
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const list = (0, vnum_js_1.extractList)(json, ['data', 'messages', 'result', 'data.messages'])
            .map(vnum_js_1.normalizeMessage);
        if (!list.length) {
            await sock.sendMessage(chatId, {
                text: `📭 No messages yet for \`${number}\`.\n\nTrigger the OTP on the target site, then run *.vnumotp ${number}* again in ~30s.`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const top = list.slice(0, 10);
        const blocks = top.map((m, i) => {
            const otp = m.otp || (0, vnum_js_1.extractOtp)(m.text);
            const header = `*${i + 1}.* ${m.from ? `*${m.from}*` : '_unknown sender_'}${m.time ? `  · ${m.time}` : ''}`;
            const otpLine = otp ? `\n🔑 *OTP: ${otp}*` : '';
            const body = m.text ? `\n${m.text}` : '';
            return header + otpLine + body;
        });
        const text = ` ⟮ 📞 ${botName} ⟯⊷
 *MESSAGES FOR \`${number}\`*

 Total: ${list.length}

${blocks.map(block => ` ${block}`).join('\n\n')}

 *Tip:* re-run .vnumotp ${number} to refresh.
⊷

_⚡ Powered by ${botName}_`;
        await sock.sendMessage(chatId, {
            text: text
        }, { quoted: messageConfig_js_1.fakeSender });
    }
};

module.exports = exports.default;
