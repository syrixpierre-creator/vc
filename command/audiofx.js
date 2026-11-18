
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const effectsMenu =
'🎧 *Audio Effects* (Levanter style upgrade) 🎧\n\n' +
'• *avec*  • *bass*  • *black*\n' +
'• *blown* • *cut*   • *deep*\n' +
'• *earrape* • *fast* • *fat*\n' +
'• *histo* • *low*   • *nightcore*\n' +
'• *pitch* • *robot* • *slow*\n' +
'• *smooth* • *treble* • *tupai*\n' +
'• *vector* • *reverse* • *chipmunk*\n• *demon* • *baby*\n\n' +
'📌 *Usage:*\n' +
'Reply to an audio / voice note with:\n' +
'Example: *.bass*  or  *.audiofx nightcore*';

function getFilter(cmd) {
  if (/bass/i.test(cmd)) return 'equalizer=f=94:width_type=o:width=2:g=30';
  if (/blown/i.test(cmd)) return 'acrusher=.1:1:64:0:log';
  if (/deep/i.test(cmd)) return 'atempo=1,asetrate=44500*2/3';
  if (/earrape/i.test(cmd)) return 'volume=12';
  if (/fast/i.test(cmd)) return 'atempo=1.63';
  if (/fat/i.test(cmd)) return 'atempo=1.6';
  if (/nightcore/i.test(cmd)) return 'atempo=1.06,asetrate=44100*1.25';
  if (/reverse/i.test(cmd)) return 'areverse';
  if (/robot/i.test(cmd))
    return "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)'";
  if (/slow/i.test(cmd)) return 'atempo=0.7';
  if (/tupai|squirrel|chipmunk/i.test(cmd)) return 'asetrate=44100*1.5,atempo=0.8';
  // New from Levanter menu
  if (/avec/i.test(cmd)) return 'aecho=0.8:0.88:60:0.4';
  if (/black/i.test(cmd)) return 'volume=0.1';
  if (/cut/i.test(cmd)) return 'atrim=0:3';
  if (/histo/i.test(cmd)) return 'ahistogram=dmode=separate';
  if (/low/i.test(cmd)) return 'equalizer=f=200:width_type=o:width=2:g=-10,equalizer=f=1000:width_type=o:width=2:g=-5';
  if (/pitch/i.test(cmd)) return 'asetrate=44100*1.3,atempo=0.8';
  if (/smooth/i.test(cmd)) return 'lowpass=f=1000';
  if (/treble/i.test(cmd)) return 'equalizer=f=3000:width_type=o:width=2:g=10';
  if (/vector/i.test(cmd)) return 'afftfilt=real=\'re*cos(0.5)\':imag=\'im*sin(0.5)\'';
  if (/demon/i.test(cmd)) return 'asetrate=44100*0.5,atempo=0.8';
  if (/baby/i.test(cmd)) return 'asetrate=44100*1.5,atempo=1.2';
  return null;
}

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
  command: 'audiofx',
  aliases: ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'robot', 'slow', 'chipmunk', 'tupai', 'avec', 'black', 'cut', 'histo', 'low', 'pitch', 'smooth', 'treble', 'vector', 'demon', 'baby'],
  category: 'menu',
  description: 'Apply audio effects to voice notes (Levanter upgrade)',
  usage: '.bass / .nightcore / .vector (reply to audio)',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const cmd = message.body || args.join(' ');
    const filter = getFilter(cmd);

    const audioBuffer = await getAudio(message);
    if (!audioBuffer || !filter) {
      return await sock.sendMessage(
        chatId,
        { text: effectsMenu },
        { quoted: message }
      );
    }

    try {
      const tmp = path.join(__dirname, '../temp');
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

      const input = path.join(tmp, `in_${Date.now()}.ogg`);
      const output = path.join(tmp, `out_${Date.now()}.ogg`);

      fs.writeFileSync(input, audioBuffer);

      let ffmpegBin = 'ffmpeg';
      try { ffmpegBin = require('@ffmpeg-installer/ffmpeg').path; } catch {}
      exec(
        `"${ffmpegBin}" -y -i "${input}" -af "${filter},aresample=48000,asetpts=N/SR" -c:a libopus -b:a 64k -ac 1 "${output}"`,
        async () => {
          const out = fs.readFileSync(output);
          await sock.sendMessage(
            chatId,
            { audio: out, mimetype: 'audio/ogg; codecs=opus', ptt: true },
            { quoted: message }
          );
          try { fs.unlinkSync(input); } catch {}
          try { fs.unlinkSync(output); } catch {}
        }
      );
    } catch {
      await sock.sendMessage(chatId, { text: '❌ Audio processing failed. Make sure ffmpeg is installed.' }, { quoted: message });
    }}
};
