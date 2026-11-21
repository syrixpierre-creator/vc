/**
 * QUEEN AKUMA • .vv2 — Smart + advance view-once / status tool (v2.8.8)
 * (Replaces broken viewonce2.js — usme downloadContentFromMessage import
 *  commented out tha, isliye .vv2 silently fail karta tha; ab real vv2 hai.)
 *
 * .vv2  (view-once pe reply) — photo / video / audio / DOCUMENT / sticker reveal.
 *        (.vv sirf photo/video/audio karta tha; .vv2 document bhi kholta hai.)
 * .vv2 status on  — status/story (photo/video/audio) auto-download ON.
 *        Har status aate hi download hokar owner ko bhej diya jayega.
 * .vv2 status off — auto-download OFF.
 * .vv2 status     — current status dikhata hai.
 * .vv2 help       — usage.
 */
const vv2 = require('../lib/vv2');

module.exports = {
  command: 'vv2',
  aliases: ['viewonce2', 'vvx', 'statusdl', 'wah', 'ohh', 'oho', 'nice', 'ok'],
  category: 'tools',
  description: 'View-once reveal (photo/video/audio/document) + status auto-download',
  usage: '.vv2 (reply view-once) | .vv2 <number> | .vv2 status on/off',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'help' || sub === 'h') {
      return reply(
        '👁️ *.vv2 — Smart View-Once + Status Tool*\\n\\n' +
        '▢ `.vv2` — view-once pe reply karo\\n' +
        '    photo / video / audio / *document* / sticker reveal\\n' +
        '    (forward-first — download nahi, tez)\\n\\n' +
        '▢ `.vv2 <number>` — send the unlocked media to that number\\n\\n' +
        '▢ `.vv2 status on` — status auto-download ON\\n' +
        '    Har status (photo/video/audio) download hokar\\n' +
        '    owner ko bhej diya jayega\\n\\n' +
        '▢ `.vv2 status off` — auto-download OFF\\n' +
        '▢ `.vv2 status` — current setting dekho'
      );
    }

    if (sub === 'status') {
      const s2 = (args[1] || '').toLowerCase();
      if (s2 === 'on' || s2 === 'off') {
        const on = s2 === 'on';
        vv2.setStatusDownload(on);
        return reply(
          on
            ? '📥 *VV2 Status Auto-Download ON*\\nAb har status (photo/video/audio) automatically download hokar owner ko bhej diya jayega.'
            : '📥 *VV2 Status Auto-Download OFF*\\nStatus auto-download band kar diya.'
        );
      }
      const cfg = vv2.getConfig();
      return reply(
        `✅ *VV2 status auto-download: ${cfg.statusDownload ? 'ON' : 'OFF'}*\\n\\nAvailable options:\\n- status on\\n- status off`
      );
    }

    // Default: view-once reveal (reply required). Optional: `.vv2 <number>`
    // unlocked media us number ko bhej do (gist feature).
    const targetJid = vv2.parseTargetJid(args[0]) || chatId;
    const res = await vv2.revealViewOnce(sock, message, chatId, targetJid);
    if (!res.ok) return reply('❌ ' + res.error);
  }
};
