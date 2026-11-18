/**
 * QUEEN AKUMA • .menu3 + .menutheme — v2.5.0 THEME: ✨ NEON
 * Neon text style + Fullwidth headers + sparkle emojis (premium look).
 * .menu  = classic  |  .menu2 = 👑 ROYAL (bold)  |  .menu3 = ✨ NEON
 */
const settings = require('../settings');
const commandHandler = require('../lib/commandHandler');
const { allFonts, convertText } = require('../lib/fonts');
const NEON = allFonts[39];     // Neon
const FULL = allFonts[9];      // Fullwidth
const SCRIPT = allFonts[4];    // Script
const N = (t) => convertText(String(t), NEON);
const F = (t) => convertText(String(t), FULL);
const S = (t) => convertText(String(t), SCRIPT);

function prefix() {
  return (settings.prefixes && settings.prefixes[0]) || '.';
}

function fmtUptime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function buildNeonMenu() {
  const p = prefix();
  const bot = settings.botName || 'QUEEN AKUMA';
  const total = (commandHandler.commands && commandHandler.commands.size > 0) ? commandHandler.commands.size : 2696;
  const cats = commandHandler.categories || new Map();
  const top = [...cats.entries()]
    .map(([name, list]) => ({ name, n: list.length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 12);

  let text = `✨ ════ ${N('NEON MENU')} ════ ✨\n`;
  text += `💫 ${S(bot)} 💫\n`;
  text += `┃  ⚡ ${N('Version')}: *${settings.version || '2.6.2'}*\n`;
  text += `┃  📚 ${N('Commands')}: *${total}*\n`;
  text += `┃  ⏱️ ${N('Uptime')}: *${fmtUptime(process.uptime())}*\n`;
  text += `┃  👑 ${N('Owner')}: *${settings.botOwner || 'INCONNU BOY SENSEI'}*\n`;
  text += `┃  💎 ${N('Theme')}: *NEON* ✨\n`;
  text += `╚═══════════════════╝\n\n`;

  text += `🌟 ${N('TOP CATEGORIES')} 🌟\n\n`;
  for (const c of top) {
    text += `✦ ${F(c.name.toUpperCase())} — _(${c.n})_\n`;
  }
  text += `\n⚡ ${N('TRY THESE')} ⚡\n`;
  text += `🤖 \`${p}eliteai <sawal>\` — AI chat\n`;
  text += `🎨 \`${p}eliteimg <prompt>\` — AI image\n`;
  text += `🌤️ \`${p}weather <city>\` — live weather\n`;
  text += `🧠 \`${p}smart <kuch bhi>\` — smart router\n`;
  text += `🔤 \`${p}fonts\` — 40 text styles\n`;
  text += `🎵 \`${p}play <song>\` — music\n`;
  text += `\n━━━━━━━━━━━━━━━━\n`;
  text += `👑 Royal theme: \`${p}menu2\`  •  📖 Classic: \`${p}menu\`\n`;
  text += `🎨 All themes: \`${p}menutheme\`\n`;
  text += `📢 Channel: ${settings.channelLink || ''}`;
  return text;
}

module.exports = {
  commands: [
    {
      command: 'menu3',
      aliases: ['neonmenu', 'm3'],
      category: 'main',
      description: 'Neon theme menu (premium)',
      usage: '.menu3',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const text = buildNeonMenu();
        // v3.6.1: menu.js jaisa guard — resolveMediaFast bina timeout ke 30s
        // tak atak sakta hai aur {url} fallback ka send hang kar sakta hai
        // (Catbox unreachable ho to .menu ka jawab hi nahi aata). Pehle buffer
        // (1.5s race), phir probe, phir send (8s race); fail ho to text menu.
        try {
          const { getMediaBuffer, probeUrl } = require('../lib/mediaCache');
          const raceSend = (p) => Promise.race([
            Promise.resolve(p),
            new Promise((_, rej) => setTimeout(() => rej(new Error('media-send-timeout')), 8000)),
          ]);
          let img = null;
          try {
            img = await Promise.race([
              Promise.resolve(getMediaBuffer(settings.menuImage)),
              new Promise((r) => setTimeout(() => r(null), 1500)),
            ]);
          } catch (_) {}
          if (img && Buffer.isBuffer(img)) {
            await raceSend(sock.sendMessage(chatId, { image: img, caption: text }, { quoted: message }));
            return;
          }
          if (settings.menuImage && (await probeUrl(settings.menuImage, 3000))) {
            await raceSend(sock.sendMessage(chatId, { image: { url: settings.menuImage }, caption: text }, { quoted: message }));
            return;
          }
        } catch (_) {}
        await sock.sendMessage(chatId, { text }, { quoted: message });
      },
    },
    {
      command: 'menutheme',
      aliases: ['themes', 'menuthemes'],
      category: 'main',
      description: 'Set or list menu themes (classic/royal/neon)',
      usage: '.menutheme | .menutheme <classic|royal|neon>',
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const p = prefix();
        const { getTheme, setTheme } = require('../lib/menuTheme');
        const arg = String((args && args[0]) || '').toLowerCase().trim();
        // .menutheme <name> — theme SET karo (menu/menu2/menu3 bhi naam ke taur par chalte hain)
        // OWNER/ADMIN LOCK (2026-11-16): theme bot-wide setting hai — sirf owner
        // ya group admin hi badal sakta hai. List (bina arg) sab dekh sakte hain.
        const nameMap = { classic: 'classic', menu: 'classic', default: 'classic', off: 'classic', royal: 'royal', menu2: 'royal', neon: 'neon', menu3: 'neon' };
        if (arg && nameMap[arg]) {
          const senderId = context.senderId || message.key.participant || message.key.remoteJid;
          let allowed = !!message.key.fromMe || !!context.senderIsOwnerOrSudo || !!context.isOwnerOrSudoCheck;
          if (!allowed && (context.isGroup || String(chatId).endsWith('@g.us'))) {
            try {
              const st = await require('../lib/isAdmin')(sock, chatId, senderId);
              allowed = !!st.isSenderAdmin;
            } catch (_) { allowed = false; }
          }
          if (!allowed) {
            return sock.sendMessage(chatId, { text:
              `🚫 *You are not authorized to use this command!*\n\n` +
              `Theme dekhne ke liye: \`${p}menutheme\``
            }, { quoted: message });
          }
          const saved = setTheme(nameMap[arg]);
          const label = saved === 'classic' ? '📖 Classic' : saved === 'royal' ? '👑 ROYAL' : '✨ NEON';
          return sock.sendMessage(chatId, { text:
            `✅ *Menu theme set: ${label}*\n\n` +
            `Ab \`${p}menu\` ${label} style me dikhega.\n` +
            `Wapas badalne ke liye: \`${p}menutheme <classic|royal|neon>\``
          }, { quoted: message });
        }
        if (arg) {
          return sock.sendMessage(chatId, { text:
            `❌ Theme nahi mila: *${arg}*\n\n` +
            `Sahi naam: \`classic\`, \`royal\` ya \`neon\`\n` +
            `Example: \`${p}menutheme royal\``
          }, { quoted: message });
        }
        const current = getTheme();
        const mark = (t) => (current === t ? ' ✅ (current)' : '');
        await sock.sendMessage(chatId, { text:
          `🎨 *QUEEN AKUMA Menu Themes*\n\n` +
          `📖 *Classic* — \`${p}menu\`${mark('classic')}\n   Default menu, photo + full list\n\n` +
          `👑 *ROYAL* — \`${p}menu2\`${mark('royal')}\n   Bold text style + crown emojis, category view\n   Try: \`${p}menu2 download\`\n\n` +
          `✨ *NEON* — \`${p}menu3\`${mark('neon')}\n   Neon text style + sparkle emojis, top categories + stats\n\n` +
          `💡 Theme set karne ke liye: \`${p}menutheme <classic|royal|neon>\`\n` +
          `   Example: \`${p}menutheme neon\`\n\n` +
          `💎 Sabhi themes me fakevCard quote + fast cached media milta hai.`
        }, { quoted: message });
      },
    },
  ],
};
