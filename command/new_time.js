"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
exports.default = {
    command: 'time',
    aliases: ['timezone', 'tz'],
    category: 'general',
    description: 'Show current time in any timezone',
    usage: '.time [IANA TZ]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        const tz = args[0] || 'UTC';
        try {
            const now = new Date();
            // Get current time in the specified timezone
            const timeStr = now.toLocaleString('en-GB', {
                timeZone: tz,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            // Get timezone offset
            const offset = now.toLocaleString('en-GB', {
                timeZone: tz,
                timeZoneName: 'shortOffset'
            }).split(' ').pop() || '';
            // Get the actual timezone abbreviation
            const tzName = now.toLocaleString('en-GB', {
                timeZone: tz,
                timeZoneName: 'short'
            }).split(' ').pop() || tz;
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🕐 ${botName} ⟯⊷
 *TIME ZONE: ${tz}*

 🕐 ${timeStr}
 📍 ${tzName} ${offset}

 *Timezone info:*
  ${tz}
  ${tzName} (${offset || 'UTC'})

 *Examples:*
 .time Africa/Lagos
 .time America/New_York
 .time Asia/Tokyo
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
        }
        catch (error) {
            console.error('time error:', error.message);
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🕐 ${botName} ⟯⊷
 *TIME ZONE ERROR*

 ❌ Unknown timezone: *${tz}*

 *Valid timezones use IANA format:*
  Africa/Lagos
  America/New_York
  Asia/Tokyo
  Europe/London
  UTC

 *Usage:*
 .time <timezone>
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
        }
    }
};

module.exports = exports.default;
