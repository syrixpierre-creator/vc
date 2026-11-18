'use strict';
/**
 * QUEEN AKUMA — .ss / .screenshot / .ssweb (website screenshot).
 * Pehle ye prexzyapis (DEAD) use karta tha AUR config/fakeSender undefined
 * hone se har call par crash karta tha. Ab real: image.thum.io screenshot
 * API (free, no key, live-verified 2026-11-16) — QUEEN AKUMA branding ke saath.
 */
const axios = require('axios');
const settings = require('../settings');

const BOT_NAME = (settings && settings.botName) || 'QUEEN AKUMA';

function normalizeUrl(input) {
    if (!input) return null;
    let u = String(input).trim();
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try {
        const parsed = new URL(u);
        if (!parsed.hostname.includes('.')) return null;
        return parsed.toString();
    } catch { return null; }
}

module.exports = {
    command: 'ss',
    aliases: ['screenshot', 'webss', 'ssweb', 'capture'],
    category: 'tools',
    description: 'Screenshot a website (image.thum.io, free).',
    usage: '.ss <url>',
    handler: async (sock, message, args, context) => {
        const chatId = context.chatId || message.key.remoteJid;
        const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
        const target = normalizeUrl((args || [])[0]);
        if (!target) {
            await reply('📸 *WEBSITE SCREENSHOT*\n\nUsage: *.ss <url>*\n\nExamples:\n• .ss https://google.com\n• .ss github.com\n\nNote: http:// ya https:// nahi diya to https:// maan liya jayega.');
            return;
        }
        await sock.sendMessage(chatId, { react: { text: '📸', key: message.key } }).catch(() => {});
        try {
            const shotUrl = 'https://image.thum.io/get/width/1280/' + target;
            const res = await axios.get(shotUrl, {
                responseType: 'arraybuffer', timeout: 45000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const ct = String((res.headers && res.headers['content-type']) || '');
            if (!ct.startsWith('image/') || !res.data || res.data.length < 1000) {
                await reply('⚠️ Screenshot nahi ban paya — site ne block kiya ho sakta hai. Koi aur URL try karo.');
                return;
            }
            await sock.sendMessage(chatId, {
                image: Buffer.from(res.data),
                caption: '📸 *WEBSITE SCREENSHOT*\n\n🌐 ' + new URL(target).hostname + '\n🔗 ' + target + '\n\n⚡ ' + BOT_NAME
            }, { quoted: message });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } }).catch(() => {});
        } catch (err) {
            await reply('⚠️ Screenshot failed: ' + String(err.message || err).slice(0, 120) + '\nThodi der baad try karo ya koi aur URL do.');
        }
    }
};
