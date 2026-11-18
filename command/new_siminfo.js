"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.default = {
    command: 'siminfo',
    aliases: ['phoneinfo', 'numinfo', 'carrier', 'phinfo'],
    category: 'utility',
    description: 'Lookup phone number country, carrier and type',
    usage: '.siminfo <phone number with country code>\nExample: .siminfo +91XXXXXXXX',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join('').trim().replace(/\s+/g, '');
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `📱 *SIM / Phone Info*\n\n` +
                    `*Usage:* \`.siminfo <number>\`\n\n` +
                    `*Examples:*\n` +
                    `• \`.siminfo +91XXXXXXXX\` — Kenya\n` +
                    `• \`.siminfo +14155552671\` — USA\n` +
                    `• \`.siminfo +447911123456\` — UK\n` +
                    `ℹ️ Include country code with or without +`,
                ...channelInfo
            }, { quoted: message });
        }
        try {
            const scriptPath = path_1.default.join(process.cwd(), 'lib', 'siminfo.py');
            const { stdout } = await execAsync(`python3 "${scriptPath}" "${input}"`, { timeout: 10000 });
            const data = JSON.parse(stdout.trim());
            if (data.error) {
                return await sock.sendMessage(chatId, {
                    text: `❌ ${data.error}`,
                    ...channelInfo
                }, { quoted: message });
            }
            const validIcon = data.valid ? '✅' : '⚠️';
            const carrierLine = data.carrier !== 'Unknown' ? `\n📶 *Carrier:* ${data.carrier}` : '';
            await sock.sendMessage(chatId, {
                text: `📱 *Phone Number Info*\n\n` +
                    `🔢 *Number:* ${data.number}\n` +
                    `${data.flag} *Country:* ${data.country}\n` +
                    `🌍 *Region:* ${data.region}\n` +
                    `🏷️ *Country Code:* ${data.country_code}\n` +
                    `📞 *National Number:* ${data.national_number}\n` +
                    `📡 *Line Type:* ${data.line_type}` +
                    `${carrierLine}\n` +
                    `${validIcon} *Valid:* ${data.valid ? 'Yes' : 'Possibly invalid (check length)'}`,
                ...channelInfo
            }, { quoted: message });
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Lookup failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

module.exports = exports.default;
