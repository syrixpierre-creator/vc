"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const WA_LIMIT = 60000;
function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}
async function sendResult(sock, chatId, channelInfo, message, text, filename) {
    if (text.length > WA_LIMIT) {
        const tmpFile = path_1.default.join(process.cwd(), 'temp', filename);
        fs_1.default.mkdirSync(path_1.default.dirname(tmpFile), { recursive: true });
        fs_1.default.writeFileSync(tmpFile, text);
        await sock.sendMessage(chatId, {
            document: fs_1.default.readFileSync(tmpFile),
            mimetype: 'text/plain',
            fileName: filename,
            caption: '🌐 Result too large for WhatsApp, sent as file.',
            ...channelInfo
        }, { quoted: message });
        try {
            fs_1.default.unlinkSync(tmpFile);
        }
        catch { }
    }
    else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}
exports.default = {
    command: 'urldecode',
    aliases: ['urlencode', 'urlextract', 'links', 'extractlinks'],
    category: 'utility',
    description: 'Encode/decode URLs or extract all links from text/files',
    usage: '.urldecode <url>\n.urlencode <text>\n.extractlinks <text or reply to file>',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, userMessage } = context;
        const scriptPath = path_1.default.join(process.cwd(), 'lib', 'urltool.py');
        if (!fs_1.default.existsSync(scriptPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ urltool.py not found in lib/.`,
                ...channelInfo
            }, { quoted: message });
        }
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;
        // Detect mode from command used
        let mode = 'decode';
        if (userMessage.startsWith('urlencode') || userMessage.startsWith('/urlencode') ||
            userMessage.startsWith('.urlencode') || userMessage.startsWith('!urlencode')) {
            mode = 'encode';
        }
        else if (userMessage.startsWith('extractlinks') || userMessage.startsWith('/extractlinks') ||
            userMessage.startsWith('.extractlinks') || userMessage.startsWith('!extractlinks') ||
            userMessage.startsWith('links')) {
            mode = 'extract';
        }
        else if (args[0]?.toLowerCase() === 'encode') {
            mode = 'encode';
            args = args.slice(1);
        }
        else if (args[0]?.toLowerCase() === 'extract' || args[0]?.toLowerCase() === 'links') {
            mode = 'extract';
            args = args.slice(1);
        }
        else if (args[0]?.toLowerCase() === 'decode') {
            mode = 'decode';
            args = args.slice(1);
        }
        const textInput = args.join(' ').trim() || quotedText;
        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `🌐 *URL Tools*\n\n` +
                    `*Decode a URL:*\n` +
                    `\`.urldecode https://example.com/path%20with%20spaces\`\n\n` +
                    `*Encode text to URL:*\n` +
                    `\`.urlencode hello world & more\`\n\n` +
                    `*Extract all links from text:*\n` +
                    `\`.extractlinks <paste text>\`\n` +
                    `Or reply to any text message or file with \`.extractlinks\`\n\n` +
                    `*Shortcut modes:*\n` +
                    `\`.urldecode encode <text>\`\n` +
                    `\`.urldecode extract <text>\``,
                ...channelInfo
            }, { quoted: message });
        }
        const tempDir = path_1.default.join(process.cwd(), 'temp');
        fs_1.default.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();
        try {
            let stdout;
            if (hasDoc && quoted && mode === 'extract') {
                // Download and extract from file
                await sock.sendMessage(chatId, { text: '⏳ Reading file...', ...channelInfo }, { quoted: message });
                const msgObj = { message: { documentMessage: quoted.documentMessage } };
                const buf = await (0, baileys_1.downloadMediaMessage)(msgObj, 'buffer', {});
                const tmpFile = path_1.default.join(tempDir, `url_in_${id}.txt`);
                fs_1.default.writeFileSync(tmpFile, buf);
                const result = await execAsync(`python3 "${scriptPath}" extract --file "${tmpFile}"`, { timeout: 30000 });
                stdout = result.stdout;
                try {
                    fs_1.default.unlinkSync(tmpFile);
                }
                catch { }
            }
            else {
                const safeText = textInput.replace(/'/g, "'\"'\"'");
                const result = await execAsync(`python3 "${scriptPath}" ${mode} '${safeText}'`, { timeout: 30000 });
                stdout = result.stdout;
            }
            const data = JSON.parse(stdout.trim());
            if (data.error) {
                return await sock.sendMessage(chatId, { text: `❌ ${data.error}`, ...channelInfo }, { quoted: message });
            }
            let resultText = '';
            if (mode === 'decode') {
                resultText = `🌐 *URL Decoder*\n\n` +
                    `📥 *Original:*\n\`${data.original}\`\n\n` +
                    `📤 *Decoded:*\n\`${data.decoded}\``;
                if (data.scheme)
                    resultText += `\n\n🔍 *Breakdown:*\n• Scheme: ${data.scheme}\n• Host: ${data.host}\n• Path: ${data.path}`;
                if (data.query_params) {
                    const params = Object.entries(data.query_params).map(([k, v]) => `  • ${k}: ${v}`).join('\n');
                    resultText += `\n• Params:\n${params}`;
                }
                if (data.fragment)
                    resultText += `\n• Fragment: ${data.fragment}`;
            }
            else if (mode === 'encode') {
                resultText = `🌐 *URL Encoder*\n\n` +
                    `📥 *Original:*\n\`${data.original}\`\n\n` +
                    `🔒 *Fully Encoded:*\n\`${data.fully_encoded}\`\n\n` +
                    `🔓 *Safe Encoded:*\n\`${data.safe_encoded}\``;
            }
            else {
                // Extract
                if (data.total === 0) {
                    resultText = `🌐 *Link Extractor*\n\n❌ No links found in the text.`;
                }
                else {
                    const lines = [`🌐 *Link Extractor — ${data.total} links found*\n`];
                    if (data.social?.length) {
                        lines.push(`📱 *Social Media (${data.social.length}):*`);
                        data.social.forEach((u) => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.media?.length) {
                        lines.push(`🖼️ *Media Files (${data.media.length}):*`);
                        data.media.forEach((u) => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.documents?.length) {
                        lines.push(`📄 *Documents (${data.documents.length}):*`);
                        data.documents.forEach((u) => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.other?.length) {
                        lines.push(`🔗 *Other Links (${data.other.length}):*`);
                        data.other.forEach((u) => lines.push(`• ${u}`));
                    }
                    resultText = lines.join('\n');
                }
            }
            await sendResult(sock, chatId, channelInfo, message, resultText, `urls_${id}.txt`);
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

module.exports = exports.default;
