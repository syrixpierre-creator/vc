/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.siputzx.my.id/api/r/lahelu')
    if (!res.ok) throw 'Failed mengambil data'

    let json = await res.json()
    if (!json.status || !json.data || !json.data.length) throw 'Data kosong'

    // Pilih random post
    let post = json.data[Math.floor(Math.random() * json.data.length)]
    let media = post.media
    let mediaType = post.mediaType // 0: image, 1: video
    let title = post.title
    let author = post.userInfo?.username || 'unknown'
    let upvote = post.totalUpvotes || 0
    let link = post.postID || 'https://lahelu.com'

    let caption = `📮 *${title}*\n👤 @${author}\n👍 ${upvote} upvotes\n🔗 ${link}`

    if (mediaType === 1) {
      await conn.sendFile(m.chat, media, 'video.mp4', caption, m)
    } else if (mediaType === 0) {
      await conn.sendFile(m.chat, media, 'image.jpg', caption, m)
    } else {
      throw 'Format media not didukung.'
    }
  } catch (e) {
    console.error(e)
    m.reply(`❌ Failed mengambil konten from Lahelu.\n${e}`)
  }
}

handler.help = ['lahelu']
handler.tags = ['random']
handler.command = /^lahelu$/i
handler.limit = true
module.exports = handler