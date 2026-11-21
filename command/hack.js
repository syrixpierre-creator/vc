/**
 * QUEEN AKUMA v3.2.0 — .hack (prank) + .hack set (full customise, owner-only)
 * Purana .hack 20 alag messages bhejta tha (slow + spammy). Ab EK message
 * edit hota hai progress ke saath — fast aur clean.
 * .hack @user — prank chalao | .hack set name/msg/speed/steps/step/on/off/reset/show
 */
const hackCfg = require('../lib/hackConfig');
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function num(jid) { return String(jid || '').split('@')[0].replace(/:\d+$/, ''); }

async function isOwnerOnly(senderJid) {
  try {
    const isOwner = require('../lib/isOwner');
    if (isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)) return true;
  } catch (_) {}
  return false;
}

module.exports = {
  command: 'hack',
  aliases: ['fakehack', 'prankhack'],
  category: 'fun',
  description: 'Fake hack prank',
  usage: '.hack @user | .hack set name <text> | .hack set show',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const cfg = hackCfg.load();

    // ---- .hack set — full customise (owner-only) ----
    if ((args[0] || '').toLowerCase() === 'set') {
      if (!(await isOwnerOnly(senderJid))) return reply('🚫 *You are not authorized to use this command!*');
      const key = (args[1] || 'show').toLowerCase();
      const rest = args.slice(2).join(' ').trim();
      if (key === 'show') {
        const steps = cfg.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
        return reply(`🔧 *Hack Settings*\n\nEnabled: ${cfg.enabled ? 'ON ✅' : 'OFF ❌'}\nHacker name: *${cfg.hackerName}*\nSpeed: *${cfg.speed}* (${hackCfg.delayFor(cfg.speed)}ms/step)\nSuccess msg: ${cfg.successMsg.slice(0, 120)}${cfg.successMsg.length > 120 ? '...' : ''}\n\n*Steps (${cfg.steps.length}):*\n${steps}\n\nBadlo: \`.hack set name X\` / \`.hack set msg X\` / \`.hack set speed fast\` / \`.hack set steps 4\` / \`.hack set step 2 <text>\` / \`.hack set on|off\` / \`.hack set reset\``);
      }
      if (key === 'on' || key === 'off') {
        cfg.enabled = key === 'on';
        hackCfg.save(cfg);
        return reply(`✅ Hack command *${key.toUpperCase()}* kar diya.`);
      }
      if (key === 'reset') {
        hackCfg.reset();
        return reply('✅ Hack settings reset — default wapas aa gaye.');
      }
      if (key === 'name') {
        if (!rest) return reply('❌ Usage: `.hack set name QUEEN-AKUMA-HACKER`');
        cfg.hackerName = rest.slice(0, 30);
        hackCfg.save(cfg);
        return reply(`✅ Hacker name set: *${cfg.hackerName}*`);
      }
      if (key === 'msg') {
        if (!rest) return reply('📌 *Usage:* .hack set msg <text>');
        cfg.successMsg = rest.slice(0, 500);
        hackCfg.save(cfg);
        return reply('✅ Success message set kar diya.');
      }
      if (key === 'speed') {
        if (!['fast', 'normal', 'slow'].includes(rest.toLowerCase())) return reply('❌ Usage: `.hack set speed fast|normal|slow`');
        cfg.speed = rest.toLowerCase();
        hackCfg.save(cfg);
        return reply(`✅ Speed set: *${cfg.speed}*`);
      }
      if (key === 'steps') {
        const n = parseInt(rest, 10);
        if (!n || n < 3 || n > 10) return reply('❌ Usage: `.hack set steps 6` (3-10)');
        if (n > cfg.steps.length) {
          while (cfg.steps.length < n) cfg.steps.push(`⏳ Step ${cfg.steps.length + 1}...`);
        } else {
          cfg.steps = cfg.steps.slice(0, n);
        }
        hackCfg.save(cfg);
        return reply(`✅ Steps set: *${n}*`);
      }
      if (key === 'step') {
        const n = parseInt(args[2], 10);
        const text = args.slice(3).join(' ').trim();
        if (!n || n < 1 || n > cfg.steps.length || !text) return reply(`❌ Usage: \`.hack set step 2 <text>\` (1-${cfg.steps.length})`);
        cfg.steps[n - 1] = text.slice(0, 100);
        hackCfg.save(cfg);
        return reply(`✅ Step ${n} set: *${cfg.steps[n - 1]}*`);
      }
      return reply('🔧 *Hack Settings*\n\n`.hack set show` — settings dekho\n`.hack set name X` — hacker name\n`.hack set msg X` — success message ({user}/{hacker})\n`.hack set speed fast|normal|slow`\n`.hack set steps <3-10>`\n`.hack set step <n> <text>`\n`.hack set on|off`\n`.hack set reset`');
    }

    // ---- .hack prank ----
    if (!cfg.enabled) return reply('❌ Hack command band hai. Owner `.hack set on` kare.');
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || message.message?.imageMessage?.contextInfo || {};
    const mentioned = ctxInfo.mentionedJid && ctxInfo.mentionedJid[0];
    const repliedTo = ctxInfo.participant;
    const targetJid = mentioned || repliedTo || senderJid;
    const targetName = mentioned || repliedTo ? `@${num(targetJid)}` : (message.pushName || 'target');
    const total = cfg.steps.length;
    const stepDelay = hackCfg.delayFor(cfg.speed);
    try {
      const sent = await sock.sendMessage(chatId, { text: `💻 *${cfg.hackerName} hacking ${targetName}...*\n\n[] 0%`, mentions: [targetJid] }, { quoted: message });
      for (let i = 0; i < total; i++) {
        await delay(stepDelay);
        const pct = Math.round(((i + 1) / total) * 100);
        const filled = Math.round((pct / 100) * 20);
        const bar = ''.repeat(filled) + ''.repeat(20 - filled);
        const stepText = cfg.steps[i];
        try {
          await sock.sendMessage(chatId, { text: `💻 *${cfg.hackerName} hacking ${targetName}...*\n\n${stepText}\n[${bar}] ${pct}%`, mentions: [targetJid], edit: sent.key });
        } catch (_) {
          await sock.sendMessage(chatId, { text: `${stepText}\n[${bar}] ${pct}%`, mentions: [targetJid] }, { quoted: message });
        }
      }
      await delay(500);
      const finalText = hackCfg.renderSuccess(cfg, targetName, targetJid);
      try {
        await sock.sendMessage(chatId, { text: finalText, mentions: [targetJid], edit: sent.key });
      } catch (_) {
        await sock.sendMessage(chatId, { text: finalText, mentions: [targetJid] }, { quoted: message });
      }
    } catch (e) {
      console.error('[hack]', e.message);
      await sock.sendMessage(chatId, { text: '❌ *Hack sequence error. Try again.*' }, { quoted: message });
    }
  }
};
