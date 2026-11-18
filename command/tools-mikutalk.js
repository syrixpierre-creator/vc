/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text, command }) => {
  let apikey = 'planaai'
  if (!text) throw `Send text that mau diucapkan Miku!\n\nContoh: .${command} Haloo Hilman`

  await m.react('🎶')

  try {
    let res = await fetch(`https://www.sankavolereii.my.id/anime/ttsmiku?apikey=${apikey}&text=${encodeURIComponent(text)}`)
    if (!res.ok) throw await res.text()

    let buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'miku.mp3', `🎶 Miku already ngomong: ${text}`, m)
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.reply('❌ Failed mengambil audio from API.')
    await m.react('❌')
  }
}

handler.help = ['mikutalk <teks>']
handler.tags = ['tools', 'sound']
handler.command = /^mikutalk$/i
handler.limit = true
module.exports = handler