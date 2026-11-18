'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .iswa / .nowa (QUEEN AKUMA / QUEEN AKUMA port).
 * .iswa <number> — ek number WhatsApp par hai ya nahi + bio.
 * .nowa <start>-<end> — number range check karo (max 20).
 * sock.onWhatsApp + fetchStatus use karta hai, koi API nahi.
 */
function normalize(num) {
  return String(num || '').replace(/[^0-9]/g, '');
}

module.exports = {
  commands: [
    {
      command: 'iswa',
      aliases: ['checkwa', 'isonwa'],
      description: 'Number WhatsApp par registered hai ya nahi + bio dikhao.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const num = normalize((args || [])[0]);
        if (num.length < 10 || num.length > 15) {
          await reply('❌ Sahi number do (country code ke saath).\nExample: *.iswa 554488138425*');
          return;
        }
        const jid = num + '@s.whatsapp.net';
        try {
          const res = await sock.onWhatsApp(jid);
          const found = res && res[0];
          if (!found || !found.exists) {
            await reply('❌ *' + num + '* WhatsApp par registered *nahi* hai.');
            return;
          }
          let bio = '';
          try {
            const st = await sock.fetchStatus(jid);
            bio = st && st.status ? st.status : '';
          } catch (e) {}
          await reply('✅ *' + num + '* WhatsApp par hai.\n📱 JID: ' + found.jid + (bio ? '\n💬 Bio: ' + bio : ''));
        } catch (e) {
          await reply('❌ Check nahi ho paya: ' + String(e.message || e).slice(0, 120));
        }
      }
    },
    {
      command: 'nowa',
      aliases: ['checkrange', 'warange'],
      description: 'Number range WhatsApp check karo: .nowa 917384287400-410 (max 20).',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const raw = String((args || [])[0] || '').trim();
        const m = raw.match(/^(\d+)-(\d+)$/);
        if (!m) {
          await reply('❌ Range is format me do: *.nowa 917384287400-410*\nStart aur end number, max 20 numbers ek baar me.');
          return;
        }
        const start = m[1], end = m[2];
        // Common prefix nikalo, suffix vary karo
        let p = 0;
        while (p < start.length && p < end.length && start[p] === end[p]) p++;
        const prefix = start.slice(0, p);
        const sNum = parseInt(start.slice(p) || '0', 10);
        const eNum = parseInt(end.slice(p) || '0', 10);
        if (isNaN(sNum) || isNaN(eNum) || eNum < sNum || (eNum - sNum + 1) > 20) {
          await reply('❌ Range galat hai. End >= start hona chahiye aur max 20 numbers.');
          return;
        }
        const pad = start.slice(p).length;
        await reply('⏳ ' + (eNum - sNum + 1) + ' numbers check ho rahe hain...');
        const lines = [];
        for (let i = sNum; i <= eNum; i++) {
          const num = prefix + String(i).padStart(pad, '0');
          try {
            const res = await sock.onWhatsApp(num + '@s.whatsapp.net');
            const found = res && res[0];
            lines.push((found && found.exists ? '✅ ' : '❌ ') + num);
          } catch (e) {
            lines.push('❓ ' + num);
          }
        }
        await reply('📱 *WhatsApp Range Check*\n' + prefix + '* (' + sNum + '–' + eNum + ')\n\n' + lines.join('\n'));
      }
    }
  ]
};
