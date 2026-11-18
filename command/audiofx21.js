/**
 * QUEEN AKUMA v3.5.0 • #17 21 Audio Effects (OVL-MD-V2 Fx_audio.js se)
 * muted, reverb, vibrato, tremolo, cave, telephone, haunting, distortion,
 * phaser, chorus, flanger, compressor, surround, panorama, mono, radio,
 * alien, ghost, dizzy, buzz, lofi — sab pure ffmpeg -af, koi API nahi.
 * Usage: audio/voice note par reply karke `.reverb` (effect ka naam hi command hai).
 * Output: opus voice note (audiofx.js wala pattern, execFile se — no shell).
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const FX21 = {
  muted: 'volume=0',
  reverb: 'aecho=0.8:0.88:60:0.4',
  vibrato: 'vibrato=f=5:d=0.5',
  tremolo: 'tremolo=f=10:d=0.7',
  cave: 'aecho=0.9:0.9:1000:0.5',
  telephone: 'highpass=f=200,lowpass=f=3000',
  haunting: 'aecho=0.8:0.9:1000:0.3,atempo=0.9,asetrate=44100*0.9',
  distortion: 'acrusher=.1:1:64:0:log',
  phaser: 'aphaser=in_gain=0.4',
  chorus: 'chorus=0.5:0.9:50:0.5:0.4:40',
  flanger: 'flanger',
  compressor: 'compand=0.3:1:-90/-60|-60/-40|-40/-30|-20/-20:6:0:-90:0.2',
  surround: 'surround',
  panorama: 'stereotools=balance_in=-0.5',
  mono: 'pan=mono|c0=0.5*c0+0.5*c1',
  radio: 'bandreject=f=1000:w=100',
  alien: 'vibrato=f=8:d=0.6,asetrate=44100*1.4,atempo=1.05',
  ghost: 'aecho=0.8:0.9:500:0.6,atempo=0.8,asetrate=44100*0.85',
  dizzy: 'vibrato=f=12:d=0.8,tremolo=f=8:d=0.6',
  buzz: 'acrusher=.05:1:64:0:log,volume=1.5',
  lofi: 'lowpass=f=3000,atempo=0.9,asetrate=44100*0.9,aecho=0.5:0.5:50:0.3',
};
const FX_NAMES = Object.keys(FX21);

const menu =
  '🎧 *Audio FX — 21 Effects*\n\n' +
  FX_NAMES.map((n) => `• *${n}*`).join('  ') +
  '\n\n📌 *Usage:*\nAudio / voice note par reply karke effect ka naam bhejo.\nExample: *.reverb*  ya  *.lofi*';

async function getAudio(message) {
  const m = message.message || {};
  const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage;
  const audio = m.audioMessage || m.voiceMessage || quoted?.audioMessage || quoted?.voiceMessage;
  if (!audio) return null;
  const stream = await downloadContentFromMessage(audio, 'audio');
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'audiofx21',
  aliases: FX_NAMES,
  category: 'audio',
  description: '21 audio effects — reverb, lofi, haunting, ghost, alien, cave, telephone... (reply to audio)',
  usage: '.reverb / .lofi / .haunting (reply to audio)',
  FX21,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'audiofx21').toLowerCase();
    const filter = FX21[invoked];
    const audioBuffer = await getAudio(message);
    if (!audioBuffer || !filter) {
      return sock.sendMessage(chatId, { text: menu }, { quoted: message });
    }
    const tmp = path.join(__dirname, '../temp');
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
    const input = path.join(tmp, `fx21_in_${Date.now()}.ogg`);
    const output = path.join(tmp, `fx21_out_${Date.now()}.ogg`);
    try { fs.writeFileSync(input, audioBuffer); } catch (_) {
      return sock.sendMessage(chatId, { text: '❌ Audio save nahi ho paya.' }, { quoted: message });
    }
    let ffmpegBin = 'ffmpeg';
    try { ffmpegBin = require('@ffmpeg-installer/ffmpeg').path; } catch (_) {}
    execFile(ffmpegBin, ['-y', '-i', input, '-af', `${filter},aresample=48000,asetpts=N/SR`, '-c:a', 'libopus', '-b:a', '64k', '-ac', '1', output], { timeout: 30000 }, async (err) => {
      try { fs.unlinkSync(input); } catch (_) {}
      if (err || !fs.existsSync(output)) {
        try { fs.unlinkSync(output); } catch (_) {}
        return sock.sendMessage(chatId, { text: `❌ *${invoked}* effect apply nahi ho paya.` }, { quoted: message }).catch(() => {});
      }
      try {
        const out = fs.readFileSync(output);
        await sock.sendMessage(chatId, { audio: out, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: message });
      } catch (_) {}
      try { fs.unlinkSync(output); } catch (_) {}
    });
  },
};
