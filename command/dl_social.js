/**
 * QUEEN AKUMA — Social media downloaders (multi-API with automatic fallback)
 *  .fb  .ig  .tiktok  .twitter  .pindl  .dl (auto-detect)   |  owner: .apicheck  .addapi  .delapi  .apilist
 */
const md = require('../lib/mediaDownloader');

function linkFrom(message, args) {
  const direct = (args || []).join(' ').trim();
  const m = direct.match(/https?:\/\/\S+/i);
  if (m) return m[0];
  const q = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const qt = q && (q.conversation || q.extendedTextMessage?.text || q.imageMessage?.caption || q.videoMessage?.caption || '');
  const m2 = String(qt || '').match(/https?:\/\/\S+/i);
  return m2 ? m2[0] : '';
}

function makeDownloader(command, aliases, platform, label, example) {
  return {
    command, aliases, category: 'download',
    description: `Download ${label} video/photo (multi-API fallback)`,
    usage: `.${command} ${example}`,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const url = linkFrom(message, args);
      if (!url) return reply(`📥 *${label} Downloader*\n\nUsage: \`.${command} ${example}\`\n_Tip: you can also reply to a message that contains the link._`);
      const detected = md.detectPlatform(url);
      if (platform && detected && detected !== platform) {
        return reply(`❌ This looks like a *${detected}* link. Use \`.${detected === 'twitter' ? 'twitter' : detected === 'facebook' ? 'fb' : detected === 'instagram' ? 'ig' : detected === 'tiktok' ? 'tiktok' : 'dl'} ${url}\` or \`.dl ${url}\``);
      }
      sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } }).catch(() => {});
      try {
        const res = await md.download(url, platform || detected);
        await md.sendResult(sock, chatId, message, res, label);
        sock.sendMessage(chatId, { react: { text: '✅', key: message.key } }).catch(() => {});
      } catch (e) {
        sock.sendMessage(chatId, { react: { text: '❌', key: message.key } }).catch(() => {});
        console.error('[' + command + ']', e.message, (e.details || []).join(' | '));
        return reply(`❌ ${label} download failed.\n${e.message}\n\n_Private/removed videos can't be downloaded._`);
      }
    }
  };
}

const fb = makeDownloader('facebook', ['fb', 'fbdl', 'facebookdl', 'fbvideo', 'fbdown'], 'facebook', 'Facebook', '<facebook video link>');

module.exports = {
  ...fb,
  commands: [
    makeDownloader('instagram', ['ig', 'igdl', 'insta', 'instadl', 'instagramdl', 'reel'], 'instagram', 'Instagram', '<reel/post link>'),
    makeDownloader('tiktok', ['tt', 'tiktokdl', 'ttdl', 'tiktoknowm', 'tikwm'], 'tiktok', 'TikTok', '<tiktok link>'),
    makeDownloader('twitter', ['twdl', 'xdl', 'twitterdl', 'twittervideo'], 'twitter', 'Twitter/X', '<tweet link>'),
    makeDownloader('pindl', ['pinterestdl', 'pinvideo'], 'pinterest', 'Pinterest', '<pin link>'),
    makeDownloader('dl', ['alldl', 'getmedia', 'linkdl'], null, 'Media', '<any supported link>'),
    {
      command: 'apicheck', aliases: ['checkapi', 'apistatus', 'apitest'], category: 'owner', ownerOnly: true,
      description: 'Test every downloader API and show which ones are alive',
      usage: '.apicheck',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        await sock.sendMessage(chatId, { text: '🔎 Testing all downloader APIs… (up to ~30s)' }, { quoted: message });
        const rows = await md.checkAll();
        const ok = rows.filter((r) => r.state === 'WORKING');
        const alive = rows.filter((r) => r.state === 'ALIVE');
        const dead = rows.filter((r) => r.state === 'DEAD');
        const line = (r) => `• ${r.id} (${r.platform}) ${r.ms}ms${r.err ? ' – ' + r.err : ''}`;
        const text =
          `🛰️ *API CHECK* — ${rows.length} APIs\n\n` +
          `✅ *Working* (${ok.length})\n${ok.map(line).join('\n') || '_none_'}\n\n` +
          `🟡 *Reachable, sample link had no media* (${alive.length})\n${alive.map(line).join('\n') || '_none_'}\n\n` +
          `❌ *Dead* (${dead.length})\n${dead.map(line).join('\n') || '_none_'}\n\n` +
          `_Dead APIs are skipped automatically. Add your own: .addapi <facebook|instagram|tiktok|twitter|pinterest|youtube|*> <url with {url}>_`;
        return sock.sendMessage(chatId, { text }, { quoted: message });
      }
    },
    {
      command: 'addapi', aliases: ['addprovider'], category: 'owner', ownerOnly: true,
      description: 'Add your own downloader API',
      usage: '.addapi <platform|*> https://api.example.com/dl?url={url}',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
        const platform = (args[0] || '').toLowerCase();
        const tpl = args.slice(1).join(' ').trim();
        const valid = ['facebook', 'instagram', 'tiktok', 'twitter', 'pinterest', 'youtube', 'threads', '*'];
        if (!valid.includes(platform) || !/^https?:\/\/\S+\{url\}\S*$/i.test(tpl)) {
          return reply('Usage: `.addapi <platform> <url containing {url}>`\nPlatforms: ' + valid.join(', ') + '\nExample:\n`.addapi facebook https://api.example.com/fb?url={url}`');
        }
        const id = md.addProvider(platform, tpl);
        return reply(`✅ API added as *${id}* for *${platform}*.\nTest it with \`.apicheck\`. Remove with \`.delapi ${id}\``);
      }
    },
    {
      command: 'delapi', aliases: ['removeapi', 'delprovider'], category: 'owner', ownerOnly: true,
      description: 'Remove a custom downloader API',
      usage: '.delapi <id>',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const ok = md.removeProvider((args[0] || '').trim());
        return sock.sendMessage(chatId, { text: ok ? '🗑️ Removed.' : 'ℹ️ ID not found. See `.apilist`' }, { quoted: message });
      }
    },
    {
      command: 'apilist', aliases: ['listapi', 'providers'], category: 'owner', ownerOnly: true,
      description: 'List custom downloader APIs',
      usage: '.apilist',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const l = md.listCustom();
        return sock.sendMessage(chatId, { text: l.length ? '🔌 *Custom APIs*\n' + l.map((c) => `• ${c.id} [${(c.platforms || []).join(',')}] ${c.url}`).join('\n') : 'No custom APIs. Built-in: ' + md.allProviders().length } , { quoted: message });
      }
    }
  ]
};
