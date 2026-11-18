/**
 * QUEEN AKUMA • EliteProTech commands — only VERIFIED working endpoints
 * (probed live 2026-11-14 against https://eliteprotech-apis.zone.id).
 * .eliteai <text>      — AI chat (chatgpt/talkai/notegpt/deepseek failover)
 * .eliteimg <prompt>   — AI image (zonerai)
 * .elitetts <text>     — text to speech (AirMore, mp3 audio)
 * .elitess <url>       — website screenshot (PNG)
 * .eliteqr <image url> — QR code scan
 * .eliteocr <image url>— OCR text from image
 * .eliteshazam <audio url> — identify song
 * .eliteytmp3 <url>    — YouTube to MP3 download link
 * .eliteytmp4 <url>    — YouTube to MP4 download link
 * .eliteyt <query>     — YouTube search
 * .elitelyrics <song>  — song lyrics
 * .elitecurrency <amt> <from> <to> — currency convert (USD to INR)
 * .elitegithub <user>  — GitHub profile
 * .elitetiktok <user>  — TikTok profile (flaky upstream)
 * .elitefont <text>    — font styles for text
 * .elitemenu           — list these commands
 */
const elite = require('../lib/eliteApi');

function pickText(d) {
  if (!d) return null;
  if (typeof d === 'string') return d;
  return d.text || d.response || d.answer || d.message || d.result || null;
}

function make(cmd, aliases, desc, usage, run) {
  return {
    command: cmd, aliases, category: 'elite', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = (args || []).join(' ').trim();
      if (!input && !usage.includes('[optional]')) return reply(`❌ Usage: ${usage}`);
      try { await run(sock, chatId, message, input, args, reply); }
      catch (e) { await reply('❌ Elite API error: ' + String((e && e.message) || e).slice(0, 200)); }
    },
  };
}

module.exports = {
  commands: [
    make('eliteai', ['elitegpt'], 'Elite AI chat (verified endpoints)', '.eliteai <question>',
      async (sock, chatId, message, input, args, reply) => {
        let ans = null;
        for (const k of ['chatgpt', 'talkai', 'notegpt', 'deepseekai']) {
          try { const d = await elite.call(k, input); ans = pickText(d); if (ans) break; } catch {}
        }
        if (!ans) return reply('❌ Elite AI busy hai. `.ai <sawal>` ya `.inconnuai <sawal>` try karo.');
        await reply('🤖 *Elite AI*\n\n' + String(ans).slice(0, 3500));
      }),
    make('eliteimg', ['eliteimage'], 'AI image from prompt (ZonerAI)', '.eliteimg <prompt>',
      async (sock, chatId, message, input, args, reply) => {
        const buf = await elite.callBuffer('zonerai', input);
        if (!buf || buf.length < 1000) return reply('❌ Image nahi bani. Dobara try karo.');
        await sock.sendMessage(chatId, { image: buf, caption: '🎨 *Elite Image*\n\n' + input }, { quoted: message });
      }),
    make('elitetts', ['elitespeak'], 'Text to speech (AirMore TTS)', '.elitetts <text>',
      async (sock, chatId, message, input, args, reply) => {
        const url = await elite.tts(input);
        if (!url) return reply('❌ TTS nahi bana. Dobara try karo.');
        const buf = await elite.getBuffer(url);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg' }, { quoted: message });
      }),
    make('elitess', ['eliteshot'], 'Website screenshot', '.elitess <url>',
      async (sock, chatId, message, input, args, reply) => {
        const url = /^https?:\/\//i.test(input) ? input : 'https://' + input;
        const buf = await elite.callBuffer('ssweb', { url });
        if (!buf || buf.length < 1000) return reply('❌ Screenshot nahi bana. Sahi URL do.');
        await sock.sendMessage(chatId, { image: buf, caption: '📸 *Screenshot*\n\n' + url }, { quoted: message });
      }),
    make('eliteqr', ['eliteqrscan'], 'Scan QR code from image URL', '.eliteqr <image url>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('qrscan', { url: input });
        const text = d && (d.data || d.result || d.text);
        await reply(text ? `🔳 *QR Scan*\n\n${text}` : '❌ QR code nahi mila is image me.');
      }),
    make('eliteocr', [], 'Read text from image URL (OCR)', '.eliteocr <image url>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('ocr', { url: input });
        const text = d && (d.text || d.result || d.data);
        await reply(text ? `🔤 *OCR*\n\n${String(text).slice(0, 3000)}` : '❌ Is image me text nahi mila.');
      }),
    make('eliteshazam', ['elitesong'], 'Identify a song from audio URL', '.eliteshazam <audio url>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('shazam', { url: input });
        const s = d && (d.data || d.result);
        if (!s || !s.title) return reply('❌ Gaana pehchana nahi gaya. Sahi audio URL do.');
        await reply(`🎵 *Shazam*\n\n🎶 ${s.title}\n👤 ${s.artist || '-'}\n💿 ${s.album || '-'}\n📅 ${s.release_date || '-'}\n⏱️ ${s.duration_ms ? Math.round(s.duration_ms / 1000) + 's' : '-'}`);
      }),
    make('eliteytmp3', ['eliteymp3'], 'YouTube to MP3 download link', '.eliteytmp3 <youtube url>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('ytmp3', { url: input });
        const dl = d && d.download;
        if (!dl || !dl.downloadUrl) return reply('❌ MP3 link nahi mila. Sahi YouTube URL do.');
        await reply(`🎵 *YouTube MP3*\n\n📌 ${dl.title || ''}\n⏱️ ${dl.duration || ''}\n🔗 ${dl.downloadUrl}`);
      }),
    make('eliteytmp4', ['eliteymp4'], 'YouTube to MP4 download link', '.eliteytmp4 <youtube url>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('ytmp4', { url: input });
        const r = d && d.result;
        if (!r || !r.url) return reply('❌ MP4 link nahi mila. Sahi YouTube URL do.');
        await reply(`🎬 *YouTube MP4*\n\n📌 ${r.title || ''}\n📦 ${r.size ? (r.size / 1024 / 1024).toFixed(1) + ' MB' : ''}\n🔗 ${r.url}`);
      }),
    make('eliteyt', ['eliteytsearch'], 'YouTube search', '.eliteyt <query>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('ytsearch', { q: input });
        const vids = d && d.results && d.results.videos;
        if (!vids || !vids.length) return reply('❌ Kuch nahi mila.');
        const list = vids.slice(0, 5).map((v, i) => `${i + 1}. *${v.title}*\n   ⏱️ ${v.duration || ''} • 👁️ ${v.views || ''}\n   🔗 ${v.url}`).join('\n\n');
        await reply(`🔍 *YouTube — ${input}*\n\n${list}`);
      }),
    make('elitelyrics', ['elitesonglyrics'], 'Song lyrics', '.elitelyrics <song name>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('lyrics', { query: input });
        const r = d && d.result && d.result[0];
        if (!r || !r.plainLyrics) return reply('❌ Lyrics nahi mile.');
        await reply(`🎵 *${r.trackName || r.name}* — ${r.artistName || ''}\n\n${String(r.plainLyrics).slice(0, 3500)}`);
      }),
    make('elitecurrency', ['eliteconvert'], 'Currency converter', '.elitecurrency <amount> <from> <to>',
      async (sock, chatId, message, input, args, reply) => {
        const [amount, from, to] = args;
        if (!amount || !from || !to) return reply('❌ Usage: .elitecurrency 1 USD INR');
        const d = await elite.callRaw('currency', { amount, from: from.toUpperCase(), to: to.toUpperCase() });
        if (!d || d.converted === undefined) return reply('❌ Convert nahi hua. Jaise: .elitecurrency 1 USD INR');
        await reply(`💱 *Currency*\n\n${d.amount} ${d.from} = *${d.converted} ${d.to}*\nRate: 1 ${d.from} = ${d.rate} ${d.to}\n📅 ${d.date || ''}`);
      }),
    make('elitegithub', ['elitegh'], 'GitHub profile info', '.elitegithub <username>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('githubstalk', { user: input.replace(/^@/, '') });
        const r = d && d.result;
        if (!r || !r.username) return reply('❌ GitHub user nahi mila.');
        await reply(`🐙 *GitHub — ${r.username}*\n\n👤 ${r.fullName || '-'}\n📝 ${r.bio || '-'}\n👥 Followers: ${r.followers} • Following: ${r.following}\n📦 Repos: ${r.repositories} • ⭐ ${r.stars}\n📍 ${r.location || '-'}\n🔗 ${r.profileUrl || ''}`);
      }),
    make('elitetiktok', ['elitetok'], 'TikTok profile info', '.elitetiktok <username>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('tiktokstalk', { username: input.replace(/^@/, '') });
        const r = d && d.data;
        if (!r || !r.uniqueId) return reply('❌ TikTok user nahi mila (upstream kabhi kabhi down rehta hai).');
        await reply(`🎵 *TikTok — @${r.uniqueId}*\n\n👤 ${r.nickname || '-'}\n📝 ${String(r.bio || '').slice(0, 200)}\n👥 Followers: ${r.followerCount || '-'} • Following: ${r.followingCount || '-'}\n❤️ Likes: ${r.heartCount || '-'}`);
      }),
    make('elitefont', [], 'Font styles for your text (Elite)', '.elitefont <text>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await elite.callRaw('font', { text: input });
        const res = d && d.results;
        if (!res || !res.length) return reply('❌ Font nahi bana.');
        const list = res.slice(0, 12).map((r, i) => `${i + 1}. ${r.text}`).join('\n');
        await reply(`🔤 *Elite Fonts — "${input}"*\n\n${list}`);
      }),
    {
      command: 'elitemenu',
      aliases: ['elitelist'],
      category: 'elite',
      description: 'List EliteProTech commands (verified working)',
      usage: '.elitemenu',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        await sock.sendMessage(chatId, { text: `⚡ *QUEEN AKUMA Elite APIs*\n(EliteProTech — live verified)\n\n🤖 .eliteai <sawal> — AI chat\n🎨 .eliteimg <prompt> — AI image\n🔊 .elitetts <text> — text to speech\n📸 .elitess <url> — website screenshot\n🔳 .eliteqr <image url> — QR scan\n🔤 .eliteocr <image url> — OCR\n🎵 .eliteshazam <audio url> — song identify\n🎵 .eliteytmp3 <yt url> — YouTube MP3\n🎬 .eliteytmp4 <yt url> — YouTube MP4\n🔍 .eliteyt <query> — YouTube search\n🎶 .elitelyrics <song> — lyrics\n💱 .elitecurrency 1 USD INR\n🐙 .elitegithub <user>\n🎵 .elitetiktok <user>\n🔤 .elitefont <text>` }, { quoted: message });
      },
    },
  ],
};
