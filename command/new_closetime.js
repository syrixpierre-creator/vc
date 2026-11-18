"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
exports.default = {
    command: 'closetime',
    aliases: ['ct', 'closeafter', 'gcclose'],
    category: 'group',
    description: 'Close group after a countdown timer',
    usage: '.closetime <duration>',
    groupOnly: true,
    adminOnly: true,
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        if (!args.length) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 🔒 ${botName} ⟯⊷
 *CLOSE TIME COMMAND*

 *Usage:*
 .closetime <duration>

 *Examples:*
 .closetime 30s — 30 seconds
 .closetime 7m — 7 minutes
 .closetime 3h — 3 hours
 .closetime 2d — 2 days
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const input = String(args[0]).toLowerCase();
        const match = input.match(/^(\d+)(s|m|h|d)$/);
        if (!match) {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid format! Use: 30s, 7m, 3h, or 2d'
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const value = parseInt(match[1], 10);
        const unit = match[2];
        const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        const unitNames = { s: 'second(s)', m: 'minute(s)', h: 'hour(s)', d: 'day(s)' };
        const totalMs = value * multipliers[unit];
        if (totalMs <= 0) {
            await sock.sendMessage(chatId, {
                text: '❌ Duration must be greater than zero.'
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        if (totalMs > 30 * 86400000) {
            await sock.sendMessage(chatId, {
                text: '❌ Maximum duration is 30 days!'
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const startTime = Date.now();
        const endTime = startTime + totalMs;
        const formatRemaining = (ms) => {
            if (ms <= 0)
                return '00:00:00';
            const hrs = Math.floor(ms / 3600000);
            const mins = Math.floor((ms % 3600000) / 60000);
            const secs = Math.floor((ms % 60000) / 1000);
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        };
        const makeBar = (pct) => {
            const total = 20;
            const filled = Math.max(0, Math.min(total, Math.round(pct * total)));
            return ''.repeat(filled) + ''.repeat(total - filled);
        };
        const buildMsg = (remaining) => {
            const elapsed = totalMs - remaining;
            const pct = Math.min(Math.max(elapsed / totalMs, 0), 1);
            const bar = makeBar(pct);
            const pctText = Math.round(pct * 100);
            return ` ⟮ 🔒 ${botName} ⟯⊷
 *GROUP CLOSING COUNTDOWN*

 ⏱️ Duration: *${value} ${unitNames[unit]}*


   ${bar}
         ${pctText}% elapsed


 ⏳ Remaining: *${formatRemaining(remaining)}*
 🕐 Closes at: *${new Date(endTime).toLocaleTimeString()}*

 _Group will be closed automatically..._
⊷

_⚡ Powered by ${botName}_`;
        };
        // Initial countdown message
        let key = null;
        try {
            const sent = await sock.sendMessage(chatId, {
                text: buildMsg(totalMs)
            }, { quoted: messageConfig_js_1.fakeSender });
            key = sent?.key || null;
        }
        catch (e) {
            console.error('[closetime] initial send failed:', e?.message);
        }
        // Calculate interval based on duration
        let interval;
        if (totalMs <= 60000)
            interval = 5000;
        else if (totalMs <= 600000)
            interval = 30000;
        else if (totalMs <= 3600000)
            interval = 60000;
        else
            interval = 300000;
        const editTimer = setInterval(async () => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                clearInterval(editTimer);
                return;
            }
            if (!key)
                return;
            try {
                await sock.sendMessage(chatId, {
                    text: buildMsg(remaining),
                    edit: key
                }, { quoted: messageConfig_js_1.fakeSender });
            }
            catch (_) { /* WhatsApp can rate-limit edits; ignore */ }
        }, interval);
        // Authoritative close action
        setTimeout(async () => {
            clearInterval(editTimer);
            try {
                await sock.groupSettingUpdate(chatId, 'announcement');
                const bar = ''.repeat(20);
                await sock.sendMessage(chatId, {
                    text: ` ⟮ 🔒 ${botName} ⟯⊷
 *GROUP CLOSED*


   ${bar}
        100% complete


 ✅ Timer finished! Group is now *closed*.
 Only admins can send messages.
⊷

_⚡ Powered by ${botName}_`
                }, { quoted: messageConfig_js_1.fakeSender });
            }
            catch (e) {
                console.error('[closetime] groupSettingUpdate failed:', e?.message);
                await sock.sendMessage(chatId, {
                    text: `❌ Failed to close the group automatically.\n\nReason: _${e?.message || 'unknown error'}_\n\nMake sure I am a group admin so I can change settings.`
                }, { quoted: messageConfig_js_1.fakeSender });
            }
        }, totalMs);
    }
};

module.exports = exports.default;
