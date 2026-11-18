/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
📌 Nama Fitur: Info Gempa
🏷️ Type : Plugin ESM
🔗 Sumber :  https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
🔗 Api : https://api.siputzx.my.id/api/info/bmkg
✍️ Convert By ZenzXD
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  let res = await fetch('https://api.siputzx.my.id/api/info/bmkg');
  if (!res.ok) throw 'Failed mengambil data from API.';

  let json = await res.json();
  if (!json.status) throw 'Data not found.';

  const gempa = json.data.auto.Infogempa.gempa;

  let teks = `*Info Gempa BMKG Terkini*\n\n` +
             `*Tanggal:* ${gempa.Tanggal}\n` +
             `*Jam:* ${gempa.Jam}\n` +
             `*Magnitudo:* ${gempa.Magnitude}\n` +
             `*Kedalaman:* ${gempa.Kedalaman}\n` +
             `*Lokasi:* ${gempa.Wilayah}\n` +
             `*Koordinat:* ${gempa.Coordinates} (${gempa.Lintang}, ${gempa.Bujur})\n` +
             `*Potensi:* ${gempa.Potensi}\n` +
             `*Dirasakan:* ${gempa.Dirasakan}`;

  await conn.sendMessage(m.chat, {
    text: teks,
    contextInfo: {
      externalAdReply: {
        title: 'BMKG - Info Gempa Terkini',
        body: `Magnitude ${gempa.Magnitude} | ${gempa.Wilayah}`,
        thumbnailUrl: `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`,
        sourceUrl: 'https://bmkg.go.id',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true
      }
    }
  }, { quoted: m });
};
module.exports = handler;

handler.command = ['infogempa'];
handler.tags = ['info'];
handler.help = ['infogempa'];