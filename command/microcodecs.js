'use strict';
/**
 * QUEEN AKUMA v3.5.0 — micro-codecs (CHAMA port).
 * .unbase64 .dbinary .rcolor .pick .timenow .count — sab local, no API.
 * (.base64 khud imp_base64.js me real hai; .binary native binary.js me hai.)
 */
module.exports = {
  commands: [
    {
      command: 'unbase64',
      aliases: ['b64decode', 'decodeb64'],
      description: 'Base64 text decode karo.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const input = (args || []).join(' ').trim();
        if (!input) { await reply('❌ Base64 text do.\nExample: *.unbase64 aGVsbG8=*'); return; }
        try {
          const out = Buffer.from(input.replace(/\s/g, ''), 'base64').toString('utf8');
          await reply('🔓 *Decoded:*\n' + out);
        } catch (e) {
          await reply('❌ *Invalid base64.*');
        }
      }
    },
    {
      command: 'dbinary',
      aliases: ['binarydecode', 'bin2text'],
      description: 'Binary (0101...) ko text me badlo.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const input = (args || []).join(' ').replace(/\s/g, '');
        if (!/^[01]+$/.test(input) || input.length % 8 !== 0) {
          await reply('📌 *Usage:* .dbinary <8-bit binary groups>');
          return;
        }
        let out = '';
        for (let i = 0; i < input.length; i += 8) out += String.fromCharCode(parseInt(input.slice(i, i + 8), 2));
        await reply('🔓 *Decoded:*\n' + out);
      }
    },
    {
      command: 'rcolor',
      aliases: ['randomcolor', 'colorpick'],
      description: 'Random color (hex + RGB) do.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const r = Math.floor(Math.random() * 256), g = Math.floor(Math.random() * 256), b = Math.floor(Math.random() * 256);
        const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
        await sock.sendMessage(chatId, { text: '🎨 *Random Color*\n\nHEX: ' + hex + '\nRGB: rgb(' + r + ', ' + g + ', ' + b + ')' }, { quoted: message });
      }
    },
    {
      command: 'pick',
      aliases: ['choose', 'randompick'],
      description: 'List me se random ek chuno: .pick a | b | c',
      category: 'fun',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const joined = (args || []).join(' ');
        const items = joined.split(/[|,]/).map((s) => (s || '').trim()).filter(Boolean);
        if (items.length < 2) {
          await reply('❌ Kam se kam 2 options do.\nExample: *.pick chai | coffee | juice*');
          return;
        }
        const chosen = items[Math.floor(Math.random() * items.length)];
        await reply('🎲 *Pick:* ' + chosen + '\n\nOptions: ' + items.join(', '));
      }
    },
    {
      command: 'timenow',
      aliases: ['now', 'timeist'],
      description: 'Show the current time (IST + UTC).',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const now = new Date();
        const ist = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
        const utc = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        await sock.sendMessage(chatId, { text: '🕐 *Current time*\n\n🇮🇳 IST: ' + ist + '\n🌍 UTC: ' + utc }, { quoted: message });
      }
    },
    {
      command: 'count',
      aliases: ['wordcount', 'charcount'],
      description: 'Text ke characters/words/lines gino.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const text = (args || []).join(' ');
        if (!text) { await reply('❌ Text do.\nExample: *.count hello world*'); return; }
        const chars = text.length;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const lines = text.split('\n').length;
        await reply('🔢 *Count*\n\nCharacters: ' + chars + '\nWords: ' + words + '\nLines: ' + lines);
      }
    }
  ]
};
