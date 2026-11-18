/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = require('cheerio');

async function resep(makanan) {
  let BASE = `https://cookpad.com/id/cari/${encodeURIComponent(makanan)}`;
  let { data } = await axios.get(BASE);

  let $ = cheerio.load(data);
  let hasil = [];

  $("li[data-search-tracking-target='result']").each((i, el) => {
    let namaResep = $(el).find("h2 a").text().trim();
    let linkResep = "https://cookpad.com" + $(el).find("h2 a").attr("href");
    let waktuMasak = $(el).find(".mise-icon-time + .mise-icon-text").text().trim();
    let pembuat = $(el).find(".flex.items-center span.text-cookpad-gray-600").text().trim();

    hasil.push({ namaResep, linkResep, waktuMasak, pembuat });
  });

  return hasil;
}

const handler = async (m, { conn, text }) => {
  const query = text.trim();
  const results = await resep(query);

  if (results.length === 0) {
    return conn.sendMessage(m.chat, { text: "Sorry, resep not found." }, { quoted: m });
  }

  let response = "Berikut adalah result search resep:\n\n";
  results.forEach((item, index) => {
    response += `${index + 1}. ${item.namaResep}\nLink: ${item.linkResep}\nWaktu Masak: ${item.waktuMasak}\nPembuat: ${item.pembuat}\n\n`;
  });

  response += "=====================\nJadilah that pertama membagikannya. Yuk ikut berbagi resep and bantu pengguna lainnya!";

  conn.sendMessage(m.chat, { text: response }, { quoted: m });
}

handler.help = ['resep'].map(v => v + ' <query>');
handler.command = /^(resep)$/i;
handler.limit = false;
module.exports = handler;