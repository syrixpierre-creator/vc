/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
📌 Nama Fitur: Fake KTP Generator
🏷️ Type : Plugin ESM
🔗 Sumber API: https://fastrestapis.fasturl.cloud/maker/ktp
✍️ Convert oleh ZenzXD
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

const handler = async (m, { conn, args, text, command }) => {
  if (!text || !text.includes('|')) {
    return m.reply(`Enter data lengkap dipisahkan with "|".\nContoh:\n.${command} JAWA BARAT|BANDUNG|3275024509970001|BUDI SANTOSO|BANDUNG, 25-09-1997|LAKI-LAKI|A|JL. SUDIRMAN NO. 123|05/08|RAWA BOBO|PASAR MINGGU|ISLAM|Not yet MENIKAH|PEGAWAI SWASTA|WNI|SEUMUR HIDUP|25-09-2023|https://link.pasfoto.jpg`)
  }

  let [
    provinsi, kota, nik, nama, ttl, jk, goldar, alamat, rtRw, kelDesa,
    kecamatan, agama, status, pekerjaan, kewarganegaraan, masaBerlaku, terbuat, pasPhoto
  ] = text.split('|').map(v => v.trim())

  if (!pasPhoto) return m.reply('Data not lengkap, pastikan all 18 parameter terisi.')

  try {
    const apiUrl = `https://fastrestapis.fasturl.cloud/maker/ktp?provinsi=${encodeURIComponent(provinsi)}&kota=${encodeURIComponent(kota)}&nik=${encodeURIComponent(nik)}&nama=${encodeURIComponent(nama)}&ttl=${encodeURIComponent(ttl)}&jenisKelamin=${encodeURIComponent(jk)}&golonganDarah=${encodeURIComponent(goldar)}&alamat=${encodeURIComponent(alamat)}&rtRw=${encodeURIComponent(rtRw)}&kelDesa=${encodeURIComponent(kelDesa)}&kecamatan=${encodeURIComponent(kecamatan)}&agama=${encodeURIComponent(agama)}&status=${encodeURIComponent(status)}&pekerjaan=${encodeURIComponent(pekerjaan)}&kewarganegaraan=${encodeURIComponent(kewarganegaraan)}&masaBerlaku=${encodeURIComponent(masaBerlaku)}&terbuat=${encodeURIComponent(terbuat)}&pasPhoto=${encodeURIComponent(pasPhoto)}`

    await conn.sendMessage(m.chat, {
      image: { url: apiUrl },
      caption: `✅ *KTP Success Dibuat*\n\n• Name: ${nama}\n• NIK: ${nik}\n• TTL: ${ttl}\n• Provinsi: ${provinsi}\n• Kota: ${kota}`
    }, { quoted: m })

  } catch (e) {
    m.reply('Failed membuat KTP. Pastikan data already correct.')
    console.error(e)
  }
}

handler.help = ['cktp <data>']
handler.tags = ['maker']
handler.command = /^cktp$/i
module.exports = handler