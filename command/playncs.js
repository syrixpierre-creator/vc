/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Fitur : Play NCS
API : https://api.sxtream.xyz
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, command }) => {
  try {
    let res = await fetch('https://api.sxtream.xyz/audio/ncs-music')
    if (!res.ok) throw await res.text()
    let json = await res.json()
    if (!json.result || !json.result.length) throw '❌ No musik that available.'


    let track = json.result[Math.floor(Math.random() * json.result.length)]

    let caption = `🎵 *${track.title}*
👤 *Artists:* ${track.artists}
🎧 *Genre:* ${track.genre || '-'}
📅 *Rilis:* ${track.release_info}
🌐 [Track Page](${track.track_page_url})`

    await conn.sendMessage(m.chat, {
      audio: { url: track.download_url },
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${track.title} - ${track.artists}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: track.title,
          body: track.artists,
          thumbnailUrl: track.image_url,
          sourceUrl: track.track_page_url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      },
      caption
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ Failed memutar lagu. Try again nanti.')
  }
}

handler.help = ['playncs']
handler.tags = ['sound']
handler.command = /^playncs$/i
handler.limit = true
module.exports = handler