/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = ((__i)=>__i&&__i.default?__i.default:__i)(require('cheerio'));

async function googleImg(query) {
  try {
    const { data: html } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&sclient=mobile-gws-wiz-img&udm=2`);
    const $ = cheerio.load(html);

    const imageUrls = [];
    $('img.DS1iW').each((i, el) => {
      const imgUrl = $(el).attr('src');
      if (imgUrl) imageUrls.push(imgUrl);
    });

    return imageUrls;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

async function handler(m, { text, conn }) {
  if (!text) return m.reply('Enter kata kunci search image!\n\nContoh: *.googleimg Naruto*');

  const images = await googleImg(text);
  if (images.length < 3) return m.reply('Image that found kurang from 3, coba kata kunci lain.');

  let caption = `🔍 *Result Search From:* ${text}\n📸 *Total Search:* ${images.length}`;
  m.reply(caption);

  let maxImages = images.slice(0, Math.min(5, images.length));
  for (let img of maxImages) {
    await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
  }
}

handler.help = ['googleimg'];
handler.tags = ['search']
handler.command = ['googleimg'];
handler.limit = false;
module.exports = handler;