/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
hitamin waifu bisa pilih filter
type plugins esm
sumber : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
sumber scarape : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/3637

*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

const FILTERS = ['Coklat', 'Hitam', 'Nerd', 'Piggy', 'Carbon', 'Botak']

async function Hytamkan(imageUrl, filter = 'Hitam') {
  const selected = FILTERS.find(f => f.toLowerCase() === filter.toLowerCase())
  if (!selected) throw `Filter *${filter}* not available.\n\nFilter available:\n${FILTERS.join(', ')}`

  const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' })
  const base64Input = Buffer.from(imgRes.data).toString('base64')

  const res = await axios.post('https://wpw.my.id/api/process-image', {
    imageData: base64Input,
    filter: selected.toLowerCase()
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://wpw.my.id',
      'Referer': 'https://wpw.my.id/',
    }
  })

  const dataUrl = res.data?.processedImageUrl
  if (!dataUrl?.startsWith('data:image/')) throw 'Failed processing image.'

  return dataUrl
}

let handler = async (m, { conn, args, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})

  try {
    if (command == 'waifufilterlist') {
      const listText = `🎨 *Available filters:*\n\n${FILTERS.map(f => `• ${f}`).join('\n')}

📌 *Usage:* reply to an image with .waifuhtm <filter>`

      await conn.reply(m.chat, listText, m)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
      return
    }

    if (!m.quoted) throw 'Reply image waifu-nya first bang!'
    if (!/image/.test(m.quoted.mimetype)) throw 'That direply harus image!'

    const filter = args[0] || 'Hitam'
    const media = await m.quoted.download()
    const url = `data:${m.quoted.mimetype};base64,${media.toString('base64')}`

    const result = await Hytamkan(url, filter)
    await conn.sendFile(m.chat, result, 'waifu.png', `✅ *Success di-${filter} kan!*`, m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ *Error:* ${e}`, m)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key }})
  }
}

handler.help = ['waifuhtm [filter]', 'waifufilterlist']
handler.tags = ['tools']
handler.command = /^(waifuhtm|waifufilterlist)$/i
handler.limit = true
module.exports = handler