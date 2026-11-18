'use strict';
/**
 * QUEEN AKUMA v3.5.0 — VCF group export (queen-akuma port).
 * Poore group ke contacts .vcf file me export karo.
 * (.vcf naam savecontact ka hai — use touch nahi kiya; ye .vcfgen hai.)
 * .vcfread — quoted .vcf file padh ke contacts ki list dikhao.
 */
const mediaDl = require('../lib/mediaDl');
const { getMedia } = mediaDl;

module.exports = {
  commands: [
    {
      command: 'vcfgen',
      aliases: ['vcfgroup', 'exportvcf', 'groupexport'],
      description: 'Group ke saare contacts .vcf file me export karo.',
      category: 'group',
      groupOnly: true,
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        let meta = null;
        try { meta = await sock.groupMetadata(chatId); } catch (e) {
          await reply('❌ Group info nahi mili: ' + String(e.message || e).slice(0, 100));
          return;
        }
        const parts = meta.participants || [];
        if (!parts.length) { await reply('❌ Group me koi member nahi mila.'); return; }
        const lines = [];
        for (const p of parts) {
          const num = String(p.id).split('@')[0];
          lines.push('BEGIN:VCARD', 'VERSION:3.0', 'FN:' + num, 'TEL;TYPE=CELL:' + num, 'END:VCARD');
        }
        const vcf = lines.join('\n') + '\n';
        const name = (meta.subject || 'group').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 30) + '.vcf';
        await sock.sendMessage(chatId, {
          document: Buffer.from(vcf, 'utf8'), mimetype: 'text/vcard',
          fileName: name,
          caption: '👥 *Group Contacts Export*\n\n📇 ' + parts.length + ' contacts\n👥 Group: ' + (meta.subject || '')
        }, { quoted: message });
      }
    },
    {
      command: 'vcfread',
      aliases: ['readvcf'],
      description: 'Quoted .vcf file padh ke contacts dikhao.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const media = await getMedia(message, []);
        // documentMessage bhi chahiye — getMedia kinds filter khaali ho to kuch nahi deta; direct download karo
        let buf = null;
        const qm = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.quotedMessage;
        const doc = qm && qm.documentMessage;
        if (doc) {
          try {
            const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
            const stream = await downloadContentFromMessage(doc, 'document');
            const chunks = [];
            for await (const c of stream) chunks.push(c);
            buf = Buffer.concat(chunks);
          } catch (e) {}
        }
        if (!buf && media) buf = media.buffer;
        if (!buf) {
          await reply('❌ Pehle kisi .vcf file pe reply karo, phir *.vcfread* chalao.');
          return;
        }
        const text = buf.toString('utf8');
        const names = [...text.matchAll(/^FN:(.+)$/gm)].map((m) => m[1].trim());
        const tels = [...text.matchAll(/^TEL[^:]*:(.+)$/gm)].map((m) => m[1].trim());
        if (!names.length && !tels.length) {
          await reply('❌ Is file me koi contacts nahi mile.');
          return;
        }
        const lines = names.map((n, i) => (i + 1) + '. ' + n + (tels[i] ? ' — ' + tels[i] : ''));
        const out = '📇 *VCF Contacts* (' + names.length + ')\n\n' + lines.slice(0, 50).join('\n') + (lines.length > 50 ? '\n...aur ' + (lines.length - 50) : '');
        await reply(out);
      }
    }
  ]
};
