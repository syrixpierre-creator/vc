/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Jangan Hapus Wm Bang

*Ai simi  Plugins Esm*

Ai Nya Toxic Anjir

*[Sumber]*
https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J

*[Sumber Scrape]*

https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/516
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));
const { URLSearchParams } = require('url');

async function simSimi(text, languageCode = 'id') {
  const url = 'https://api.simsimi.vn/v1/simtalk';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  };

  const data = new URLSearchParams();
  data.append('text', text);
  data.append('lc', languageCode);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data.toString(),
    });

    const rawResponse = await response.text();

    try {
      const jsonResponse = JSON.parse(rawResponse);
      return jsonResponse.message || 'Sorry, aku not mengerti.';
    } catch (error) {
      console.error('Respons bukan JSON:', rawResponse);
      return 'Sorry, there is error in processing jawaban.';
    }
  } catch (error) {
    console.error('Error asking SimSimi:', error);
    return 'Sorry, an error occurred saat menghubungi SimSimi.';
  }
}

let handler = async (m, { text, args }) => {
  if (!text) return m.reply('Berikan Pertanyaan.');

  let language = 'id';
  let response = await simSimi(text, language);
  m.reply(response);
};

handler.help = ['simi'];
handler.tags = ['ai']
handler.command = ['simi'];
handler.limit = true;
module.exports = handler;