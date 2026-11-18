/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { conn }) => {
  try {
    let url = 'https://api.siputzx.my.id/api/r/cecan/indonesia'
    let caption = `🇮🇩 *Random Cecan Indonesia*\nAsli lokal, senyumnya bikin adem 😍`

    await conn.sendFile(m.chat, url, 'cecan-indo.jpg', caption, m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Failed ambil image cecan Indonesia.\n${e}`)
  }
}

handler.help = ['cecanindo']
handler.tags = ['random']
handler.command = /^cecanindo$/i
handler.limit = true
module.exports = handler