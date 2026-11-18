/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Author : Reza[RezoytOFFICIAL]
Fitur : Dafont
Api by : Crafters team
Sumber : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
#JANGANDIHAPUS
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { text, conn }) => {
  if (!text) throw 'Enter name font that ingin dicari!\nContoh: .dafont coolvetica';

  const url = `https://api.crafters.biz.id/search/dafont?text=${encodeURIComponent(text)}`;

  try {
    let res = await fetch(url);
    if (!res.ok) throw 'Failed mengambil data from API';

    let json = await res.json();
    if (!json.status || !json.result || json.result.length === 0) throw 'Font not found!';

    let font = json.result[0];
    let caption = `*Judul:* ${font.title}
*Kategori:* ${font.category}
*Lisensi:* ${font.license}
*Unduhan:* ${font.downloads}
*Link Unduh:* ${font.downloadUrl}`;

    await conn.sendFile(m.chat, font.previewUrl, 'preview.png', caption, m);
  } catch (e) {
    console.error(e);
    throw typeof e === 'string' ? e : (e.message || 'An error occurred saat mengambil font');
  }
};

handler.help = ['dafont <nama>'];
handler.tags = ['internet'];
handler.command = /^dafont$/i;
module.exports = handler;