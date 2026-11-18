/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, text }) => {
    if (!text) {
        return m.reply(
            "Example:\n.fakepilih Messi,Ronaldo"
        )
    }

    let [teks1, teks2] = text.split(",")

    if (!teks1 || !teks2) {
        return m.reply(
            "Format salah!\nContoh:\n.fakepilih Messi,Ronaldo"
        )
    }

    try {
        await m.reply("⏳ Membuat image...")

        const url = `https://api.synoxcloud.biz.id/canvas/drakehotline?teks1=${encodeURIComponent(teks1.trim())}&teks2=${encodeURIComponent(teks2.trim())}`

        await conn.sendMessage(m.chat, {
            image: { url },
            caption: "✅ Fake Pilih Success"
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: ${e.message}`)
    }
}

handler.help = ["fakepilih <teks1,teks2>"]
handler.tags = ["fun"]
handler.command = /^fakepilih$/i
module.exports = handler