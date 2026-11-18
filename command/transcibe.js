/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
 • Fitur By Anomaki Team
 • Created : xyzan code
 • Transkrip Youtube DiJamin Akurat
 • Jangan Hapus Wm
 • https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J

 using web : https://kome.ai/tools/youtube-transcript-generator
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
let handler = async (m, {
  text,
  conn
}) => {
  if (!text) return m.reply('Enter URL video YouTube.');
  try {
    let url = 'https://api.kome.ai/api/tools/youtube-transcripts';
    let data = {
      video_id: text,
      format: true
    };

    let res = await axios.post(url, data, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/${Math.floor(100 + Math.random() * 30)}.0.0.0 Safari/537.36`,
        'Referer': 'https://kome.ai/tools/youtube-transcript-generator'
      }
    });

    let json = res.data;
    if (!json || !json.transcript) return m.reply('Video Tersebut No Perkataan:V.');

    await m.reply(`📄 *Transkrip Video:*\n\n${json.transcript}`);

  } catch (error) {
    console.error(error);
    await m.reply('{Error} saat mengambil transkrip.');
  }
};

handler.help = ['transcibe url-video-yt'];
handler.tags = ['tools'];
handler.command = /^transcibe$/i;
handler.limit = true;
module.exports = handler;