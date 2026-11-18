"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
const vnum_js_1 = (function(){try{return require("../lib/vnum");}catch(e){return {};}}());
exports.default = {
    command: 'vnum',
    aliases: ['vnumcountries', 'numbers'],
    category: 'utility',
    description: 'List countries with available virtual numbers',
    usage: '.vnum',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        let json;
        try {
            json = await (0, vnum_js_1.fetchVnum)('sms24-countries');
        }
        catch (err) {
            await sock.sendMessage(chatId, {
                text: (0, vnum_js_1.friendlyError)(err)
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const rawList = (0, vnum_js_1.extractList)(json, ['data', 'countries', 'result', 'data.countries']);
        const countries = rawList.map(vnum_js_1.normalizeCountry).filter(c => c.code);
        if (!countries.length) {
            await sock.sendMessage(chatId, {
                text: '⚠️ No countries returned by sms24 right now. Try again later.'
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const top = countries.slice(0, 60);
        const lines = top.map((c, i) => `${String(i + 1).padStart(2, ' ')}. ${c.flag ? c.flag + ' ' : ''}${c.name} — \`${c.code}\``);
        const more = countries.length > top.length
            ? `\n…and ${countries.length - top.length} more.`
            : '';
        const text = ` ⟮ 📞 ${botName} ⟯⊷
 *VIRTUAL NUMBER COUNTRIES*

 Total: ${countries.length}

${lines.map(line => ` ${line}`).join('\n')}${more ? `\n ${more}` : ''}

 *Next:*
 .vnumget <country-code>
 Example: .vnumget ${top[0]?.code || 'us'}
⊷

_⚡ Powered by ${botName}_`;
        await sock.sendMessage(chatId, {
            text: text
        }, { quoted: messageConfig_js_1.fakeSender });
    }
};

module.exports = exports.default;
