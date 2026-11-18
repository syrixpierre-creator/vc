/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Jangan Hapus Wm Bang

*Image To Promot Plugins Esm*

Iya In aja Si Meskipun Gak tw apa

*[Sumber]*
https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J

*[Sumber Scrape]*

https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/165
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

async function imageToPrompt(buffer) {
  let image64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  let { data } = await axios.post('https://www.chat-mentor.com/api/ai/image-to-text/', {
    imageUrl: image64,
    prompt: "Generate a text prompt for this image, focusing on visual elements, style, and key features."
  }, {
    headers: {
      "content-type": "application/json",
      "origin": "https://www.chat-mentor.com",
      "referer": "https://www.chat-mentor.com/features/image-to-prompt/",
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
    }
  });
  return data;
}

let handler = async (m, { usedPrefix, command }) => {
  try {

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime || !mime.startsWith('image')) throw `Reply to image with caption *${usedPrefix + command}* or send image with caption *${usedPrefix + command}*`;

    let media = await q.download();

    let result = await imageToPrompt(media);

    if (result && result.result) {
      await m.reply(result.result);
    } else {
      throw 'Cannot processing image or result invalid.';
    }
  } catch (error) {
    console.error('Error in handler:', error);
    await m.reply(`Error: ${error.message || error}`);
  }
};

handler.help = ['img2promt'];
handler.command = ['img2promt'];
handler.tags = ['ai']
handler.limit = true
handler.register = true
module.exports = handler;