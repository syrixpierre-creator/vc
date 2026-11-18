/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || m.quoted?.text

  if (!text) {
    return m.reply(
      `✨ Masukin teks dong!\nContoh: .bratvid halo hilman`
    )
  }

  try {
    const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text)}`

    const { data } = await axios.get(url, {
      responseType: 'arraybuffer'
    })

    const buffer = Buffer.from(data)

    await conn.sendSticker(
      m.chat,
      buffer,
      m,
      {
        packname: global.stickpack || global.namebot,
        packpublish: global.stickauth || global.author
      }
    )
  } catch (e) {
    console.error(e)
    m.reply('Yahh error')
  }
}

handler.help = ['bratvid <teks>']
handler.tags = ['sticker']
handler.command = /^bratvid$/i
handler.limit = true
module.exports = handler