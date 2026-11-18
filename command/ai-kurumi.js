/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Enter text.\nContoh: .kurumi you who?")

  try {
    const prompt = encodeURIComponent(
      "You adalah Kurumi Tokisaki from anime Date A Live. " +
      "You berbicara with gaya imut, sedikit nakal, ramah, hangat, " +
      "kadang menggoda, dan jangan menyebut dirimu sebagai AI."
    )

    const query = encodeURIComponent(text)
    const url = `https://api.deline.web.id/ai/openai?text=${query}&prompt=${prompt}`

    const res = await fetch(url)
    const data = await res.json()

    if (!data.status || !data.result) {
      return m.reply("AI Kurumi not merespon.")
    }

    await conn.sendMessage(m.chat, {
      text: data.result,
      contextInfo: {
        externalAdReply: {
          title: "Kurumi Tokisaki AI",
          thumbnailUrl: "https://raw.githubusercontent.com/himanackerman/Image/main/1767877404043-832.jpeg",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply("Terjadi error saat menghubungi AI Kurumi.")
  }
}

handler.help = ['kurumi <teks>']
handler.tags = ['ai']
handler.command = /^kurumi$/i
handler.limit = true
module.exports = handler