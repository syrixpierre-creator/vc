'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .pdf (raganork port, LOCAL implementation).
 * Quoted photo se A4 PDF banao. Hand-rolled minimal PDF (JPEG XObject) —
 * pdfkit / image-to-pdf deps nahi hain, isliye khud ka builder (~70 lines).
 * Ek call = ek photo = ek page.
 */
const { Jimp } = require('jimp');
const mediaDl = require('../lib/mediaDl');
const { getMedia } = mediaDl;

function buildPdf(jpegBuf, w, h) {
  const pageW = 595, pageH = 842; // A4 points
  const scale = Math.min(pageW / w, pageH / h) * 0.95;
  const dw = +(w * scale).toFixed(2), dh = +(h * scale).toFixed(2);
  const x = +((pageW - dw) / 2).toFixed(2), y = +((pageH - dh) / 2).toFixed(2);
  const content = 'q ' + dw + ' 0 0 ' + dh + ' ' + x + ' ' + y + ' cm /Im0 Do Q';
  const objs = [];
  objs[1] = Buffer.from('<< /Type /Catalog /Pages 2 0 R >>');
  objs[2] = Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objs[3] = Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageW + ' ' + pageH + '] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>');
  objs[4] = Buffer.from('<< /Length ' + Buffer.byteLength(content) + ' >>\nstream\n' + content + '\nendstream');
  const imgHead = Buffer.from('<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpegBuf.length + ' >>\nstream\n');
  const imgTail = Buffer.from('\nendstream');
  objs[5] = Buffer.concat([imgHead, jpegBuf, imgTail]);
  const parts = [Buffer.from('%PDF-1.4\n')];
  const offsets = [0];
  let pos = parts[0].length;
  for (let i = 1; i <= 5; i++) {
    offsets[i] = pos;
    const head = Buffer.from(i + ' 0 obj\n');
    const tail = Buffer.from('\nendobj\n');
    parts.push(head, objs[i], tail);
    pos += head.length + objs[i].length + tail.length;
  }
  const xrefPos = pos;
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  xref += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF';
  parts.push(Buffer.from(xref));
  return Buffer.concat(parts);
}

module.exports = {
  command: 'pdf',
  aliases: ['topdf', 'makepdf', 'imgtopdf'],
  description: 'Make an A4 PDF from a photo.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const media = await getMedia(message, ['image']);
    if (!media) {
      await reply('📌 *Usage:* reply to a photo with .pdf');
      return;
    }
    try {
      const img = await Jimp.read(media.buffer);
      const jpeg = await img.getBuffer('image/jpeg');
      const pdf = buildPdf(jpeg, img.bitmap.width, img.bitmap.height);
      await sock.sendMessage(chatId, {
        document: pdf, mimetype: 'application/pdf',
        fileName: 'QUEEN-AKUMA-image.pdf',
        caption: '📄 A4 PDF ready (' + img.bitmap.width + 'x' + img.bitmap.height + ')'
      }, { quoted: message });
    } catch (e) {
      await reply('❌ PDF nahi ban paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
