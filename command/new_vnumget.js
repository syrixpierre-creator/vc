"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
const vnum_js_1 = (function(){try{return require("../lib/vnum");}catch(e){return {};}}());
exports.default = {
    command: 'vnumget',
    aliases: ['vnumlist', 'getnumber'],
    category: 'utility',
    description: 'Get virtual numbers for a country',
    usage: '.vnumget <country-code>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        const country = (args[0] || '').trim().toLowerCase();
        if (!country) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 📞 ${botName} ⟯⊷
 *GET VIRTUAL NUMBERS*

 *Usage:*
 .vnumget <country-code>

 *Example:*
 .vnumget us
 .vnumget uk

 *Run .vnum to see all countries.*
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        if (!/^[a-z]{2,}$/i.test(country)) {
            await sock.sendMessage(chatId, {
                text: '⚠️ Country code should be letters only (e.g. `us`, `uk`, `ru`).'
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        let json;
        try {
            json = await (0, vnum_js_1.fetchVnum)('sms24-numbers', { country });
        }
        catch (err) {
            await sock.sendMessage(chatId, {
                text: (0, vnum_js_1.friendlyError)(err)
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const list = (0, vnum_js_1.extractList)(json, ['data', 'numbers', 'result', 'data.numbers'])
            .map(vnum_js_1.normalizeNumber)
            .filter(n => n.number);
        if (!list.length) {
            await sock.sendMessage(chatId, {
                text: `⚠️ No numbers available for *${country.toUpperCase()}* right now. Try another country with *.vnum*.`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const top = list.slice(0, 15);
        const lines = top.map((n, i) => {
            const tag = n.service ? `  _(${n.service})_` : '';
            const upd = n.updated ? `  · ${n.updated}` : '';
            return `${String(i + 1).padStart(2, ' ')}. \`${n.number}\`${tag}${upd}`;
        });
        const more = list.length > top.length ? `\n…and ${list.length - top.length} more.` : '';
        const sample = top[0].number;
        const text = ` ⟮ 📞 ${botName} ⟯⊷
 *VIRTUAL NUMBERS — ${country.toUpperCase()}*

 Total: ${list.length}

${lines.map(line => ` ${line}`).join('\n')}${more ? `\n ${more}` : ''}

 *Next:*
 .vnumotp <number>
 Example: .vnumotp ${sample}
⊷

_⚡ Powered by ${botName}_`;
        await sock.sendMessage(chatId, {
            text: text
        }, { quoted: messageConfig_js_1.fakeSender });
    }
};

module.exports = exports.default;
