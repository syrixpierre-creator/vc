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
    command: 'addprefix',
    aliases: ['addpre'],
    category: 'owner',
    description: 'Add a new command prefix',
    usage: '.addprefix @',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return sock.sendMessage(chatId, {
                text: `🔧 *Current Prefixes:* ${config_js_1.default.prefixes.join(', ')}\n\n📌 *Usage:* .addprefix ?`
            }, { quoted: message });
        }
        const newPrefix = args[0].trim();
        if (config_js_1.default.prefixes.includes(newPrefix)) {
            return sock.sendMessage(chatId, {
                text: `❌ Prefix "${newPrefix}" already exists!`
            }, { quoted: message });
        }
        // Update runtime config
        config_js_1.default.prefixes.push(newPrefix);
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
            text: `✅ *Prefix Added*\n\n➕ Added: ${newPrefix}\n📋 All prefixes: ${config_js_1.default.prefixes.join(', ')}`
        }, { quoted: message });
    }
};

module.exports = exports.default;
