/**
 * QUEEN AKUMA • Zip APIs — working no-key APIs mined from the user's zips
 * (QUEEN-AKUMA-PRO / Mishu / AURA_XMD / 1520_plugins), live-verified 2026-11-14.
 * .pickupline        — pickup line (Popcat)
 * .imdbinfo <movie>  — movie info (Popcat IMDB)
 * .elementinfo <name>— periodic table element (Popcat)
 * .funjoke           — joke (Popcat, fallback some-random-api)
 * .dogfact           — dog fact (some-random-api)
 * .animequote        — anime quote (some-random-api)
 * .fawiki <topic>    — Wikipedia search (api-faa)
 * .zbrat <text>      — brat HD image (api-faa)
 */
const zip = require('../lib/zipApis');

function make(cmd, aliases, desc, usage, run) {
  return {
    command: cmd, aliases, category: 'zipapi', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = (args || []).join(' ').trim();
      if (!input && !usage.includes('[optional]')) return reply(`❌ Usage: ${usage}`);
      try { await run(sock, chatId, message, input, args, reply); }
      catch (e) { await reply('❌ API error: ' + String((e && e.message) || e).slice(0, 200)); }
    },
  };
}

module.exports = {
  commands: [
    make('pickupline', ['pickup'], 'Pickup line (Popcat)', '.pickupline',
      async (sock, chatId, message, input, args, reply) => {
        const line = await zip.popcatPickup();
        if (!line) return reply('❌ Pickup line nahi mili. Dobara try karo.');
        await reply(`💘 *Pickup Line*\n\n${line}`);
      }),
    make('imdbinfo', ['imdb'], 'Movie info from IMDB (Popcat)', '.imdbinfo <movie name>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await zip.popcatImdb(input);
        if (!d) return reply('❌ Movie nahi mili. Sahi naam likho.');
        const ratings = (d.ratings || []).map((r) => `${r.source}: ${r.value}`).join('\n');
        await reply(`🎬 *${d.title}* (${d.year || ''})\n\n⭐ ${ratings}\n🎭 ${d.genre || ''}\n⏱️ ${d.runtime || ''}\n🎥 ${d.director || ''}\n👥 ${d.actors || ''}\n\n📝 ${d.plot || ''}`);
      }),
    make('elementinfo', ['element'], 'Periodic table element (Popcat)', '.elementinfo <element>',
      async (sock, chatId, message, input, args, reply) => {
        const d = await zip.popcatElement(input);
        if (!d) return reply('❌ Element nahi mila. Jaise: .elementinfo Iron');
        await reply(`⚗️ *${d.name}* (${d.symbol})\n\n🔢 Atomic number: ${d.atomic_number}\n⚖️ Atomic mass: ${d.atomic_mass}\n📍 Period: ${d.period} • Group: ${d.group || '-'}\n🌡️ Phase: ${d.phase || '-'}\n\n${d.summary || ''}`.slice(0, 3500));
      }),
    make('funjoke', ['zjoke'], 'Random joke (Popcat + fallback)', '.funjoke',
      async (sock, chatId, message, input, args, reply) => {
        let joke = null;
        try { joke = await zip.popcatJoke(); } catch {}
        if (!joke) { try { joke = await zip.sraJoke(); } catch {} }
        if (!joke) return reply('❌ Joke nahi mila. Dobara try karo.');
        await reply(`😂 *Joke*\n\n${joke}`);
      }),
    make('dogfact', [], 'Random dog fact', '.dogfact',
      async (sock, chatId, message, input, args, reply) => {
        const fact = await zip.sraDogFact();
        if (!fact) return reply('❌ Fact nahi mila. Dobara try karo.');
        await reply(`🐶 *Dog Fact*\n\n${fact}`);
      }),
    make('animequote', ['aquotes'], 'Random anime quote', '.animequote',
      async (sock, chatId, message, input, args, reply) => {
        const d = await zip.sraAnimuQuote();
        if (!d) return reply('❌ Quote nahi mili. Dobara try karo.');
        await reply(`🎌 *Anime Quote*\n\n"${d.quote}"\n\n— ${d.characther || d.character || 'Unknown'} (${d.anime || ''})`);
      }),
    make('fawiki', ['zwiki'], 'Wikipedia search (api-faa)', '.fawiki <topic>',
      async (sock, chatId, message, input, args, reply) => {
        const r = await zip.faaWiki(input);
        if (!r) return reply('❌ Wikipedia pe kuch nahi mila.');
        await reply(`📖 *${r.title}*\n\n${String(r.result || r.extract || '').slice(0, 3000)}\n\n🔗 ${r.url || ''}`);
      }),
    make('zbrat', [], 'Brat HD image from text (api-faa)', '.zbrat <text>',
      async (sock, chatId, message, input, args, reply) => {
        const buf = await zip.faaBrat(input);
        if (!buf || buf.length < 1000) return reply('❌ Brat image nahi bani. Dobara try karo.');
        await sock.sendMessage(chatId, { image: buf, caption: '🟢 *Brat*\n\n' + input }, { quoted: message });
      }),
  ],
};
