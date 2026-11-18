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

const HI = 'Jawab Hinglish me do (Hindi-English mix, Roman script), short aur interesting.';

module.exports = { commands: [
  aiCmd('sher', [], 'Shayari sunao', (q) => `Ek khoobsurat shayari likho — topic/mood: "${q}". 2-4 lines, emotional aur yaadgar. ${HI}`, { hint: '<mood/topic>' }),
  aiCmd('kahani', [], 'Ek line se poori kahani', (q) => `Is line se ek chhoti kahani likho (150-250 words): "${q}". Kahani me shuruaat, twist aur end ho. ${HI}`, { hint: '<ek line>' }),
  aiCmd('email', [], 'Formal email likho', (q) => `Ek professional formal email likho — purpose: "${q}". Subject line, proper greeting, body aur closing ke saath. English me likho.`, { hint: '<purpose>' }),
  aiCmd('debate', [], 'Debate ka winner decide karo', (q) => `Do logo ke beech debate hai. Dono ke points ye hain: "${q}". Dono ke points ka analysis karo, kaun sa side strong hai, aur winner declare karo with reason. ${HI}`, { hint: '<side1 vs side2>' }),
  aiCmd('interview', [], 'Mock interview questions', (q) => `Role "${q}" ke liye ek mock interview banao: 5 tough interview questions, har ek ke saath ek ideal short answer. ${HI}`, { hint: '<job role>' }),
  aiCmd('fitness', [], 'Workout + diet plan', (q) => `Ek simple workout + diet plan banao — goal/details: "${q}". Ghar par karne layak exercises, Indian khana, aur ek week ka plan. ${HI}`, { hint: '<goal, weight>' }),
  aiCmd('codeai', [], 'Code likho/explain/fix karo', (q) => `Coding help chahiye: "${q}". Agar code likhna hai to clean code do, agar explain karna hai to simple Hinglish me samjhao, agar bug hai to fix karo. Code blocks ke saath.`, { hint: '<code ya sawal>' }),
  aiCmd('quizgen', [], 'Kisi bhi topic par quiz', (q) => `Topic "${q}" par 5 multiple-choice quiz questions banao. Har question ke 4 options (A-D) aur end me answer key. Questions interesting aur medium difficulty ke hon. ${HI}`, { hint: '<topic>' }),
  aiCmd('factcheck', [], 'Kisi daawe ki sachchai check karo', (q) => `Is daawe/claim ki fact-check karo: "${q}". Sach hai, jhooth hai, ya misleading — clear verdict do, aur 2-3 lines me reason/sahi jaankari do. Agar sure nahi ho to "confirm nahi kar sakta" likho. ${HI}`, { hint: '<claim>' }),
  aiCmd('rashifal', [], 'Daily horoscope', (q) => `Rashi/sign "${q}" ka aaj ka horoscope batao: love, career, health aur lucky number/color. Fun aur positive tone me. ${HI}`, { hint: '<rashi ya birth date>' }),
  aiCmd('lovecalc', [], 'AI love compatibility', (q) => `Do naam hain: "${q}". Inki love compatibility ka fun analysis karo: percentage, strengths, ek funny tip. Romantic aur halka-phulka tone. ${HI}`, { hint: '<naam1 aur naam2>' }),
  aiCmd('roastbattle', [], 'Do logo ki roast battle', (q) => `Roast battle hai — participants: "${q}". Dono ke liye ek-ek funny roast likho (halki-phulki, offensive nahi), phir winner declare karo aur kyun. ${HI}`, { hint: '<@user1 @user2>' }),
  aiCmd('songfind', [], 'Lyrics se gaana pehchano', (q) => `Ye lyrics kis gaane ke hain: "${q}"? Gaane ka naam, singer, film/album batao. Agar sure nahi ho to best guess + similar gaane suggest karo.`, { hint: '<lyrics ki lines>' }),
  aiCmd('mathsolve', [], 'Maths step-by-step solution', (q) => `Ye maths ka sawal step-by-step solve karo: "${q}". Har step clear likho, final answer highlight karo. Hinglish me samjhao.`, { hint: '<sawal>' }),
  {
    command: 'aistick',
    aliases: ['aisticker2'],
    category: 'ai',
    description: 'Prompt se AI sticker banao',
    usage: '.aistick <prompt>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      if (!q) return reply('❌ Usage: `.aistick <prompt>`\nExample: `.aistick cute cat with sunglasses`');
      await sock.sendMessage(chatId, { text: '🎨 AI sticker bana raha hoon...' }, { quoted: message });
      const img = await pollinationsImage(q, { width: 512, height: 512 });
      if (!img.ok) return reply('❌ ' + img.error);
      try {
        const { sticker5 } = require('../lib/sticker');
        const webp = await sticker5(img.buffer, null, 'QUEEN AKUMA', 'INCONNU BOY SENSEI');
        return sock.sendMessage(chatId, { sticker: webp }, { quoted: message });
      } catch (e) {
        return sock.sendMessage(chatId, { image: img.buffer, caption: '🎨 *AI Sticker* — sticker convert nahi hua, image bhej di.' }, { quoted: message });
      }
    },
  },
  {
    command: 'imageedit',
    aliases: ['aiedit'],
    category: 'ai',
    description: 'Photo + prompt se AI edit karo',
    usage: '.imageedit <prompt> (photo par reply karo)',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || message.message?.imageMessage;
      if (!imgMsg) return reply('❌ Pehle ek photo bhejo ya photo par reply karke likho: `.imageedit anime style banao`');
      if (!q) return reply('❌ Prompt bhi likho: `.imageedit background badlo`');
      const key = process.env.GEMINI_API_KEY || '';
      if (!key) return reply('❌ *GEMINI_API_KEY nahi hai.* `.env` me set karo.');
      await sock.sendMessage(chatId, { text: '🎨 Photo edit ho rahi hai...' }, { quoted: message });
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
        if (!res.ok) return reply(`❌ Image edit fail (HTTP ${res.status}). Ye model tumhari key/region par available nahi ho sakta.`);
        const data = await res.json();
        const part = (data?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData && p.inlineData.data);
        if (!part) return reply('❌ Edited photo nahi mili. Prompt badal kar dobara try karo.');
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
    description: 'Kisi bhi bhasha me translate karo',
    usage: '.anuvad <hi|en> <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const to = (args[0] || '').toLowerCase();
      const q = args.slice(1).join(' ').trim();
      if (!to || !q) return reply('❌ Usage: `.anuvad hi Hello how are you` ya `.anuvad en Kaise ho`');
      try {
        const { translateMyMemory } = require('../lib/publicApis');
        const out = await translateMyMemory(q, to);
        if (!out) return reply('❌ Translate nahi ho paya. Dobara try karo.');
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
      if (msgs.length < 5) return reply(`❌ Abhi group me sirf ${msgs.length} messages track hue hain. Thodi baat-cheet ke baad dobara try karo (kam se kam 5 chahiye).`);
      const convo = msgs.map((m) => `${m.sender}: ${m.text}`).join('\n');
      const r = await geminiText(`Ye ek WhatsApp group ki recent baat-cheet hai. Iska short summary banao Hinglish me: main topics kya the, kaun sabse active tha, group ka mood kaisa tha. 6-8 lines me.\n\n${convo}`);
      if (!r.ok) return reply(r.error);
      return reply(`📝 *Group Summary*\n\n${r.text.slice(0, 3500)}`);
    },
  },
  {
    command: 'aimemory',
    aliases: ['memory2'],
    category: 'ai',
    description: 'Bot kya yaad rakhta hai — dekho/save karo',
    usage: '.aimemory <fact> | .aimemory | .aimemory forget',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const q = (args || []).join(' ').trim();
      if (!q) {
        const facts = aiMemory.getFacts(senderJid);
        if (!facts.length) return reply('🧠 *AI Memory*\n\nAbhi tumhare baare me kuch yaad nahi hai.\nSave karo: `.aimemory mera naam Inconnu hai` ya `.aimemory mujhe cricket pasand hai`');
        return reply(`🧠 *AI Memory — tumhare baare me:*\n\n${facts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nBhoolne ke liye: \`.aimemory forget\``);
      }
      if (q.toLowerCase() === 'forget') {
        aiMemory.forget(senderJid);
        return reply('🧠 Sab bhool gaya! Tumhare baare me kuch yaad nahi rahega.');
      }
      aiMemory.remember(senderJid, q);
      return reply(`🧠 Yaad rakh liya: "${q}"\n\nAb .demonai se baat karo to ye yaad rahega.`);
    },
  },
] };
