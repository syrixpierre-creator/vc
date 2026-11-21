/**
 * QUEEN AKUMA • .font1 .. .font40 — 40 fancy text styles.
 * (Literal `commands: [` export — loader ka prefilter yahi dhoondhta hai.)
 */
module.exports = {
  commands: [
  {
    command: 'font1',
    aliases: ['f1'],
    category: 'tools',
    description: 'Apply Bold font style',
    usage: '.font1 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #1 — Bold*\n\nUsage: .font1 <text>\nExample: .font1 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Bold*\n\n' + allFonts[0].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font2',
    aliases: ['f2'],
    category: 'tools',
    description: 'Apply Italic font style',
    usage: '.font2 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #2 — Italic*\n\nUsage: .font2 <text>\nExample: .font2 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Italic*\n\n' + allFonts[1].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font3',
    aliases: ['f3'],
    category: 'tools',
    description: 'Apply Bold Italic font style',
    usage: '.font3 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #3 — Bold Italic*\n\nUsage: .font3 <text>\nExample: .font3 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Bold Italic*\n\n' + allFonts[2].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font4',
    aliases: ['f4'],
    category: 'tools',
    description: 'Apply Monospace font style',
    usage: '.font4 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #4 — Monospace*\n\nUsage: .font4 <text>\nExample: .font4 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Monospace*\n\n' + allFonts[3].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font5',
    aliases: ['f5'],
    category: 'tools',
    description: 'Apply Script font style',
    usage: '.font5 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #5 — Script*\n\nUsage: .font5 <text>\nExample: .font5 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Script*\n\n' + allFonts[4].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font6',
    aliases: ['f6'],
    category: 'tools',
    description: 'Apply Double-struck font style',
    usage: '.font6 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #6 — Double-struck*\n\nUsage: .font6 <text>\nExample: .font6 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Double-struck*\n\n' + allFonts[5].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font7',
    aliases: ['f7'],
    category: 'tools',
    description: 'Apply Sans font style',
    usage: '.font7 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #7 — Sans*\n\nUsage: .font7 <text>\nExample: .font7 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Sans*\n\n' + allFonts[6].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font8',
    aliases: ['f8'],
    category: 'tools',
    description: 'Apply Sans Bold font style',
    usage: '.font8 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #8 — Sans Bold*\n\nUsage: .font8 <text>\nExample: .font8 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Sans Bold*\n\n' + allFonts[7].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font9',
    aliases: ['f9'],
    category: 'tools',
    description: 'Apply Fraktur font style',
    usage: '.font9 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #9 — Fraktur*\n\nUsage: .font9 <text>\nExample: .font9 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Fraktur*\n\n' + allFonts[8].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font10',
    aliases: ['f10'],
    category: 'tools',
    description: 'Apply Fullwidth font style',
    usage: '.font10 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #10 — Fullwidth*\n\nUsage: .font10 <text>\nExample: .font10 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Fullwidth*\n\n' + allFonts[9].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font11',
    aliases: ['f11'],
    category: 'tools',
    description: 'Apply Circled font style',
    usage: '.font11 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #11 — Circled*\n\nUsage: .font11 <text>\nExample: .font11 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Circled*\n\n' + allFonts[10].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font12',
    aliases: ['f12'],
    category: 'tools',
    description: 'Apply Small Caps font style',
    usage: '.font12 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #12 — Small Caps*\n\nUsage: .font12 <text>\nExample: .font12 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Small Caps*\n\n' + allFonts[11].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font13',
    aliases: ['f13'],
    category: 'tools',
    description: 'Apply Strikethrough font style',
    usage: '.font13 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #13 — Strikethrough*\n\nUsage: .font13 <text>\nExample: .font13 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Strikethrough*\n\n' + allFonts[12].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font14',
    aliases: ['f14'],
    category: 'tools',
    description: 'Apply Underline font style',
    usage: '.font14 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #14 — Underline*\n\nUsage: .font14 <text>\nExample: .font14 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Underline*\n\n' + allFonts[13].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font15',
    aliases: ['f15'],
    category: 'tools',
    description: 'Apply Tiny font style',
    usage: '.font15 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #15 — Tiny*\n\nUsage: .font15 <text>\nExample: .font15 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Tiny*\n\n' + allFonts[14].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font16',
    aliases: ['f16'],
    category: 'tools',
    description: 'Apply Squared font style',
    usage: '.font16 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #16 — Squared*\n\nUsage: .font16 <text>\nExample: .font16 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Squared*\n\n' + allFonts[15].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font17',
    aliases: ['f17'],
    category: 'tools',
    description: 'Apply Bracketed font style',
    usage: '.font17 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #17 — Bracketed*\n\nUsage: .font17 <text>\nExample: .font17 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Bracketed*\n\n' + allFonts[16].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font18',
    aliases: ['f18'],
    category: 'tools',
    description: 'Apply Spaced font style',
    usage: '.font18 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #18 — Spaced*\n\nUsage: .font18 <text>\nExample: .font18 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Spaced*\n\n' + allFonts[17].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font19',
    aliases: ['f19'],
    category: 'tools',
    description: 'Apply Upside Down font style',
    usage: '.font19 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #19 — Upside Down*\n\nUsage: .font19 <text>\nExample: .font19 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Upside Down*\n\n' + allFonts[18].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font20',
    aliases: ['f20'],
    category: 'tools',
    description: 'Apply Greek font style',
    usage: '.font20 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #20 — Greek*\n\nUsage: .font20 <text>\nExample: .font20 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Greek*\n\n' + allFonts[19].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font21',
    aliases: ['f21'],
    category: 'tools',
    description: 'Apply Gothic Bold font style',
    usage: '.font21 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #21 — Gothic Bold*\n\nUsage: .font21 <text>\nExample: .font21 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Gothic Bold*\n\n' + allFonts[20].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font22',
    aliases: ['f22'],
    category: 'tools',
    description: 'Apply Sans Italic font style',
    usage: '.font22 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #22 — Sans Italic*\n\nUsage: .font22 <text>\nExample: .font22 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Sans Italic*\n\n' + allFonts[21].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font23',
    aliases: ['f23'],
    category: 'tools',
    description: 'Apply Sans Bold Italic font style',
    usage: '.font23 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #23 — Sans Bold Italic*\n\nUsage: .font23 <text>\nExample: .font23 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Sans Bold Italic*\n\n' + allFonts[22].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font24',
    aliases: ['f24'],
    category: 'tools',
    description: 'Apply Script Bold font style',
    usage: '.font24 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #24 — Script Bold*\n\nUsage: .font24 <text>\nExample: .font24 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Script Bold*\n\n' + allFonts[23].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font25',
    aliases: ['f25'],
    category: 'tools',
    description: 'Apply Wavy font style',
    usage: '.font25 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #25 — Wavy*\n\nUsage: .font25 <text>\nExample: .font25 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Wavy*\n\n' + allFonts[24].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font26',
    aliases: ['f26'],
    category: 'tools',
    description: 'Apply Dotted font style',
    usage: '.font26 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #26 — Dotted*\n\nUsage: .font26 <text>\nExample: .font26 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Dotted*\n\n' + allFonts[25].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font27',
    aliases: ['f27'],
    category: 'tools',
    description: 'Apply Double Underline font style',
    usage: '.font27 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #27 — Double Underline*\n\nUsage: .font27 <text>\nExample: .font27 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Double Underline*\n\n' + allFonts[26].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font28',
    aliases: ['f28'],
    category: 'tools',
    description: 'Apply Leet font style',
    usage: '.font28 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #28 — Leet*\n\nUsage: .font28 <text>\nExample: .font28 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Leet*\n\n' + allFonts[27].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font29',
    aliases: ['f29'],
    category: 'tools',
    description: 'Apply Vaporwave font style',
    usage: '.font29 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #29 — Vaporwave*\n\nUsage: .font29 <text>\nExample: .font29 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Vaporwave*\n\n' + allFonts[28].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font30',
    aliases: ['f30'],
    category: 'tools',
    description: 'Apply Superscript font style',
    usage: '.font30 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #30 — Superscript*\n\nUsage: .font30 <text>\nExample: .font30 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Superscript*\n\n' + allFonts[29].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font31',
    aliases: ['f31'],
    category: 'tools',
    description: 'Apply Hearts font style',
    usage: '.font31 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #31 — Hearts*\n\nUsage: .font31 <text>\nExample: .font31 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Hearts*\n\n' + allFonts[30].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font32',
    aliases: ['f32'],
    category: 'tools',
    description: 'Apply Starry font style',
    usage: '.font32 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #32 — Starry*\n\nUsage: .font32 <text>\nExample: .font32 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Starry*\n\n' + allFonts[31].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font33',
    aliases: ['f33'],
    category: 'tools',
    description: 'Apply Arrow font style',
    usage: '.font33 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #33 — Arrow*\n\nUsage: .font33 <text>\nExample: .font33 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Arrow*\n\n' + allFonts[32].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font34',
    aliases: ['f34'],
    category: 'tools',
    description: 'Apply Zalgo Light font style',
    usage: '.font34 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #34 — Zalgo Light*\n\nUsage: .font34 <text>\nExample: .font34 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Zalgo Light*\n\n' + allFonts[33].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font35',
    aliases: ['f35'],
    category: 'tools',
    description: 'Apply Cute Brackets font style',
    usage: '.font35 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #35 — Cute Brackets*\n\nUsage: .font35 <text>\nExample: .font35 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Cute Brackets*\n\n' + allFonts[34].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font36',
    aliases: ['f36'],
    category: 'tools',
    description: 'Apply Parenthesized font style',
    usage: '.font36 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #36 — Parenthesized*\n\nUsage: .font36 <text>\nExample: .font36 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Parenthesized*\n\n' + allFonts[35].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font37',
    aliases: ['f37'],
    category: 'tools',
    description: 'Apply Black Circled font style',
    usage: '.font37 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #37 — Black Circled*\n\nUsage: .font37 <text>\nExample: .font37 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Black Circled*\n\n' + allFonts[36].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font38',
    aliases: ['f38'],
    category: 'tools',
    description: 'Apply Reverse font style',
    usage: '.font38 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #38 — Reverse*\n\nUsage: .font38 <text>\nExample: .font38 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Reverse*\n\n' + allFonts[37].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font39',
    aliases: ['f39'],
    category: 'tools',
    description: 'Apply Mirror font style',
    usage: '.font39 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #39 — Mirror*\n\nUsage: .font39 <text>\nExample: .font39 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Mirror*\n\n' + allFonts[38].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'font40',
    aliases: ['f40'],
    category: 'tools',
    description: 'Apply Neon font style',
    usage: '.font40 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const text = (args || []).join(' ').trim();
      if (!text) {
        await sock.sendMessage(chatId, { text: '✍️ *Font #40 — Neon*\n\nUsage: .font40 <text>\nExample: .font40 QUEEN AKUMA' }, { quoted: message });
        return;
      }
      const { allFonts } = require('../lib/fonts');
      await sock.sendMessage(chatId, { text: '🔤 *Neon*\n\n' + allFonts[39].convert(text) }, { quoted: message });
    }
  },
  {
    command: 'fonts',
    aliases: ['fontlist'],
    category: 'tools',
    description: 'List all 40 font styles',
    usage: '.fonts',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const { allFonts } = require('../lib/fonts');
      const list = allFonts.map((f, i) => (i + 1) + '. ' + f.name + ' — .font' + (i + 1) + ' Hello').join('\n');
      await sock.sendMessage(chatId, { text: '✍️ *QUEEN AKUMA Text Styles — 40 Fonts*\n\n' + list + '' }, { quoted: message });
    }
  }
  ]
};
