/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*

# Fitur : TikTok Music Downloader
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
# Api : https://api.vreden.my.id/api/tikmusic?url=<link>

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, args, text, command }) => {
  try {
    if (!text) throw `Enter URL TikTok!\nContoh: .${command} https://vt.tiktok.com/ZSr6HXMxk/`

    await m.reply('⏳ Currently menyelam ke lautan TikTok, please wait...')

    let res = await fetch(`https://api.vreden.my.id/api/tikmusic?url=${encodeURIComponent(text)}`)
    let json = await res.json()

    if (json.status != 200) throw `Failed mengambil data! Pastikan URL valid.`

    let { title, author, album, url } = json.result
    let info = `*Tiktok Music*\n\n`
    info += `*Judul:* ${title}\n`
    info += `*Author:* ${author}\n`
    info += `*Album:* ${album}`

    await conn.sendMessage(m.chat, {
      audio: { url },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m })

    await m.reply(info)

  } catch (e) {
    console.log(e)
    throw `❌ Error\nLogs error : ${e.message || e}`
  }
}

handler.help = ['ttmusic'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command =['ttmusic', 'ttmp3']
handler.limit = true;
module.exports = handler