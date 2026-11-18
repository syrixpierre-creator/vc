"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_js_1 = __importDefault(require("../settings"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ENV_PATH = path_1.default.join(process.cwd(), '.env');
exports.default = {
    command: 'delprefix',
    aliases: ['removeprefix', 'rmprefix'],
    category: 'owner',
    description: 'Remove a command prefix',
    usage: '.delprefix !',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return sock.sendMessage(chatId, {
                text: `🔧 *Current Prefixes:* ${config_js_1.default.prefixes.join(', ')}\n\n📌 *Usage:* .delprefix /`
            }, { quoted: message });
        }
        const removePrefix = args[0].trim();
        if (!config_js_1.default.prefixes.includes(removePrefix)) {
            return sock.sendMessage(chatId, {
                text: `❌ Prefix "${removePrefix}" not found!`
            }, { quoted: message });
        }
        if (config_js_1.default.prefixes.length === 1) {
            return sock.sendMessage(chatId, {
                text: `❌ Cannot delete the last prefix! At least one prefix is required.`
            }, { quoted: message });
        }
        // Update runtime config
        config_js_1.default.prefixes = config_js_1.default.prefixes.filter(p => p !== removePrefix);
        config_js_1.default.prefix = config_js_1.default.prefixes[0];
        // Update .env file
        let envContent = fs_1.default.existsSync(ENV_PATH) ? fs_1.default.readFileSync(ENV_PATH, 'utf-8') : '';
        if (envContent.match(/^PREFIXES=/m)) {
            envContent = envContent.replace(/^PREFIXES=.*$/m, `PREFIXES=${config_js_1.default.prefixes.join(',')}`);
        }
        else {
            envContent += `\nPREFIXES=${config_js_1.default.prefixes.join(',')}\n`;
        }
        fs_1.default.writeFileSync(ENV_PATH, envContent);
        await sock.sendMessage(chatId, {
            text: `✅ *Prefix Removed*\n\n❌ Removed: ${removePrefix}\n📋 Remaining: ${config_js_1.default.prefixes.join(', ')}`
        }, { quoted: message });
    }
};

module.exports = exports.default;
