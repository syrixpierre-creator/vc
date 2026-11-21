/**
 * QUEEN AKUMA v3.3.0 — AI Tools batch (129 ideas me se AI wale)
 * Sab Gemini (GEMINI_API_KEY) se chalte hain — key nahi hai to setup hint dete hain.
 * .sher .kahani .email .debate .interview .fitness .codeai .quizgen .factcheck
 * .rashifal .lovecalc .roastbattle .songfind .mathsolve .aistick .imageedit
 * .anuvad .vstyle .gsummary .aimemory
 */
const { geminiText, pollinationsImage, getGroupMessages } = require('../lib/aiTools');
const aiMemory = require('../lib/aiMemory');

function aiCmd(command, aliases, usage, promptFn, opts = {}) {
  return {
    command, aliases, category: 'ai', description: usage, usage: '.' + command + ' ' + (opts.hint || ''),
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      if (!q && !opts.noArgs) return reply(`❌ Usage: *.${command} ${opts.hint || '<text>'}*`);
      const prompt = promptFn(q, message);
      const r = await geminiText(prompt, opts.gemini || {});
      if (!r.ok) return reply(r.error);
      return reply(r.text.slice(0, 3800));
    },
  };
}

const HI = 'Answer in simple English, short and interesting.';

module.exports = { commands: [
  aiCmd('sher', [], 'Shayari sunao', (q) => `Write a beautiful short poem. Topic/mood: "${q}". 2-4 lines, emotional and memorable. ${HI}`, { hint: '<mood/topic>' }),
  aiCmd('kahani', [], 'Ek line se poori kahani', (q) => `Write a short story (150-250 words) from this line: "${q}". It must have a beginning, a twist and an ending. ${HI}`, { hint: '<ek line>' }),
  aiCmd('email', [], 'Formal email likho', (q) => `Write a professional formal email. Purpose: "${q}". Include a subject line, proper greeting, body and closing. Write in English.`, { hint: '<purpose>' }),
  aiCmd('debate', [], 'Decide the winner of a debate', (q) => `There is a debate between two people. Their points: "${q}". Analyse both sides, say which side is stronger, and declare a winner with the reason. ${HI}`, { hint: '<side1 vs side2>' }),
  aiCmd('interview', [], 'Mock interview questions', (q) => `Create a mock interview for the role "${q}": 5 tough interview questions, each with a short ideal answer. ${HI}`, { hint: '<job role>' }),
  aiCmd('fitness', [], 'Workout + diet plan', (q) => `Create a simple workout and diet plan. Goal/details: "${q}". Home exercises, simple meals, and a one week plan. ${HI}`, { hint: '<goal, weight>' }),
  aiCmd('codeai', [], 'Write, explain or fix code', (q) => `Coding help needed: "${q}". If code is needed, give clean code; if an explanation is needed, explain simply in English; if there is a bug, fix it. Use code blocks.`, { hint: '<code ya sawal>' }),
  aiCmd('quizgen', [], 'Kisi bhi topic par quiz', (q) => `Create 5 multiple-choice quiz questions on the topic "${q}". Each question has 4 options (A-D), and give the answer key at the end. Medium difficulty. ${HI}`, { hint: '<topic>' }),
  aiCmd('factcheck', [], 'Check if a claim is true', (q) => `Fact-check this claim: "${q}". Is it true, false, or misleading? Give a clear verdict and the reason in 2-3 lines. If you are not sure, say "cannot confirm". ${HI}`, { hint: '<claim>' }),
  aiCmd('rashifal', [], 'Daily horoscope', (q) => `Give today's horoscope for the sign "${q}": love, career, health and lucky number/color. Fun and positive tone. ${HI}`, { hint: '<rashi ya birth date>' }),
  aiCmd('lovecalc', [], 'AI love compatibility', (q) => `Two names: "${q}". Do a fun love compatibility analysis: percentage, strengths, one funny tip. Light romantic tone. ${HI}`, { hint: '<naam1 aur naam2>' }),
  aiCmd('roastbattle', [], 'Do logo ki roast battle', (q) => `Roast battle, participants: "${q}". Write one light, funny (not offensive) roast for each, then declare a winner and why. ${HI}`, { hint: '<@user1 @user2>' }),
  aiCmd('songfind', [], 'Lyrics se gaana pehchano', (q) => `Which song are these lyrics from: "${q}"? Give the song name, singer and film/album. If not sure, give your best guess and similar songs.`, { hint: '<lyrics ki lines>' }),
  aiCmd('mathsolve', [], 'Maths step-by-step solution', (q) => `Solve this math problem step by step: "${q}". Write each step clearly and highlight the final answer. Explain in English.`, { hint: '<sawal>' }),
  {
    command: 'aistick',
    aliases: ['aisticker2'],
    category: 'ai',
    description: 'Make an AI sticker from a prompt',
    usage: '.aistick <prompt>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      if (!q) return reply('❌ Usage: `.aistick <prompt>`\nExample: `.aistick cute cat with sunglasses`');
      await sock.sendMessage(chatId, { text: '🎨 Making AI sticker...' }, { quoted: message });
      const img = await pollinationsImage(q, { width: 512, height: 512 });
      if (!img.ok) return reply('❌ ' + img.error);
      try {
        const { sticker5 } = require('../lib/sticker');
        const webp = await sticker5(img.buffer, null, 'QUEEN AKUMA', 'INCONNU BOY SENSEI');
        return sock.sendMessage(chatId, { sticker: webp }, { quoted: message });
      } catch (e) {
        return sock.sendMessage(chatId, { image: img.buffer, caption: '🎨 *AI Sticker* — could not convert to sticker, sent the image.' }, { quoted: message });
      }
    },
  },
  {
    command: 'imageedit',
    aliases: ['aiedit'],
    category: 'ai',
    description: 'Edit a photo with AI using a prompt',
    usage: '.imageedit <prompt> (photo par reply karo)',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || message.message?.imageMessage;
      if (!imgMsg) return reply('📌 *Usage:* reply to a photo with .imageedit <prompt>');
      if (!q) return reply('📌 *Usage:* .imageedit <prompt>');
      const key = process.env.GEMINI_API_KEY || '';
      if (!key) return reply('❌ *GEMINI_API_KEY is missing.* Set it in `.env`.');
      await sock.sendMessage(chatId, { text: '🎨 Editing photo...' }, { quoted: message });
      try {
        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
        const buf = await downloadMediaMessage({ key: message.key, message: { imageMessage: imgMsg } }, 'buffer', {}, { logger: { level: 'silent' } });
        const b64 = Buffer.from(buf).toString('base64');
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 60000);
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=' + encodeURIComponent(key), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: q }, { inline_data: { mime_type: 'image/jpeg', data: b64 } }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }),
          signal: ctrl.signal,
        }).finally(() => clearTimeout(t));
        if (!res.ok) return reply(`❌ *Image edit failed* (HTTP ${res.status}).`);
        const data = await res.json();
        const part = (data?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData && p.inlineData.data);
        if (!part) return reply('❌ *No edited photo received.* Try another prompt.');
        const out = Buffer.from(part.inlineData.data, 'base64');
        return sock.sendMessage(chatId, { image: out, caption: `🎨 *AI Edit:* ${q}` }, { quoted: message });
      } catch (e) {
        return reply('❌ Image edit error: ' + String(e.message || e).slice(0, 150));
      }
    },
  },
  {
    command: 'anuvad',
    aliases: ['trans2'],
    category: 'ai',
    description: 'Translate to any language',
    usage: '.anuvad <hi|en> <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const to = (args[0] || '').toLowerCase();
      const q = args.slice(1).join(' ').trim();
      if (!to || !q) return reply('❌ Usage: `.anuvad hi Hello how are you` or `.anuvad en Kaise ho`');
      try {
        const { translateMyMemory } = require('../lib/publicApis');
        const out = await translateMyMemory(q, to);
        if (!out) return reply('❌ *Translation failed. Try again.*');
        return reply(`🌐 *Translate (${to.toUpperCase()})*\n\n${out}`);
      } catch (e) {
        return reply('❌ Translate error: ' + String(e.message || e).slice(0, 120));
      }
    },
  },
  {
    command: 'vstyle',
    aliases: ['voicestyle'],
    category: 'ai',
    description: 'Bot alag awaaz me bolega',
    usage: '.vstyle <normal|chipmunk|robot|deep|slow> <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const style = (args[0] || '').toLowerCase();
      const q = args.slice(1).join(' ').trim();
      const styles = ['normal', 'chipmunk', 'robot', 'deep', 'slow', 'nightcore'];
      if (!styles.includes(style) || !q) return reply('❌ Usage: `.vstyle chipmunk Hello Inconnu`\nStyles: normal, chipmunk, robot, deep, slow, nightcore');
      if (q.length > 300) return reply('❌ Text 300 characters se kam rakho.');
      try {
        const gtts = require('gtts');
        const tmp = '/tmp/vstyle-' + Date.now() + '.mp3';
        await new Promise((resolve, reject) => {
          new gtts(q, 'hi').save(tmp, (err) => (err ? reject(err) : resolve()));
        });
        const fs = require('fs');
        let buf = fs.readFileSync(tmp);
        if (style !== 'normal') {
          const editor = require('../lib/audioeditor');
          const fn = { chipmunk: 'nightcore', robot: 'robot', deep: 'deep', slow: 'slow', nightcore: 'nightcore' }[style];
          if (editor && typeof editor[fn] === 'function') buf = await editor[fn](buf, 'mp3');
        }
        const { toPTT } = require('../data/converter');
        const opus = await toPTT(buf, 'mp3');
        try { fs.unlinkSync(tmp); } catch (_) {}
        return sock.sendMessage(chatId, { audio: opus, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: message });
      } catch (e) {
        return reply('❌ Voice style error: ' + String(e.message || e).slice(0, 150));
      }
    },
  },
  {
    command: 'gsummary',
    aliases: ['groupsummary'],
    category: 'ai',
    description: 'Group ki baat ka AI summary',
    usage: '.gsummary',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!chatId.endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
      const msgs = getGroupMessages(chatId);
      if (msgs.length < 5) return reply(`❌ *Only ${msgs.length} messages tracked in this group.* Try again later (at least 5 needed).`);
      const convo = msgs.map((m) => `${m.sender}: ${m.text}`).join('\n');
      const r = await geminiText(`This is a recent WhatsApp group conversation. Write a short summary in English: main topics, who was most active, and the mood of the group. 6-8 lines.\n\n${convo}`);
      if (!r.ok) return reply(r.error);
      return reply(`📝 *Group Summary*\n\n${r.text.slice(0, 3500)}`);
    },
  },
  {
    command: 'aimemory',
    aliases: ['memory2'],
    category: 'ai',
    description: 'See or save what the bot remembers',
    usage: '.aimemory <fact> | .aimemory | .aimemory forget',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      if (!q) {
        const facts = aiMemory.getFacts(senderJid);
        if (!facts.length) return reply('🧠 *AI Memory*\n\nNothing saved about you yet.\n📌 *Usage:* .aimemory <fact about you>');
        return reply(`🧠 *AI Memory:*\n\n${facts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nForget: .aimemory forget`);
      }
      if (q.toLowerCase() === 'forget') {
        aiMemory.forget(senderJid);
        return reply('🧠 *Memory cleared.*');
      }
      aiMemory.remember(senderJid, q);
      return reply(`🧠 *Saved:* "${q}"`);
    },
  },
] };
