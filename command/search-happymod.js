/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return m.reply(`Contoh penggunaan:
${usedPrefix + command} kinemaster`)
  }

  try {
    const url = `${global.APIs.deline}/search/happymod?q=${encodeURIComponent(text)}`
    const { data } = await axios.get(url)

    if (!data.status || !data.result.length) {
      throw 'Aplikasi not found'
    }

    const list = data.result.slice(0, 5)

    let caption = `📱 *HappyMod Search*\n\n`

    for (let i = 0; i < list.length; i++) {
      let v = list[i]
      caption += `${i + 1}. *${v.title}*\n`
      caption += `📦 Package: ${v.package}\n`
      caption += `🔢 Version: ${v.version}\n`
      caption += `📏 Size: ${v.size}\n`
      caption += `✨ Mod: ${v.modInfo || '-'}\n`
      caption += `🔗 ${v.page_dl}\n\n`
    }

    m.reply(caption.trim())

  } catch (e) {
    console.error(e)
    m.reply('Failed searching di HappyMod.')
  }
}

handler.help = ['happymodsearch <query>']
handler.tags = ['search']
handler.command = /^happymodsearch$/i
handler.limit = true
module.exports = handler