/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Sertifikat Tolol
Plugin ESM
API : https://api.siputzx.my.id
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('⚠️ Enter name for sertifikatnya!\n\nContoh:\n.sertiftolol Hilman')

  try {
    let url = `https://api.siputzx.my.id/api/m/sertifikat-tolol?text=${encodeURIComponent(text)}`
    let res = await fetch(url)
    if (!res.ok) throw 'Failed mengunduh image.'

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'sertif.jpg', `🏅 Sertifikat for: *${text}*`, m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Failed membuat sertifikat. Try again nanti.')
  }
}

handler.help = ['sertiftolol <nama>', 'sertifikattolol <nama>']
handler.tags = ['maker']
handler.command = /^sertiftolol|sertifikattolol$/i
handler.limit = true
module.exports = handler