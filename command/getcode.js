/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
get code dari https://codeshare.cloudku.click
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Example usage:\n${usedPrefix + command} https://codeshare.cloudku.click/view?id=J5PNIe84`)
  let url = args[0]

  try {
    if (!url.startsWith('http') || !url.includes('codeshare.cloudku.click')) {
      return m.reply('❌ URL invalid or bukan from codeshare.cloudku.click')
    }

    let cleanUrl = url.trim().replace(/\&raw\=true$/, '') + '&raw=true'
    let res = await fetch(cleanUrl)

    if (!res.ok) throw 'Failed fetch data'

    let code = await res.text()
    if (code.length > 65535) return m.reply('❌ Kode terlalu panjang for dikirim in satu message.')

    m.reply(code)
  } catch (e) {
    m.reply(`❌ An error occurred saat mengambil kode.\n\n${e}`)
  }
}

handler.help = ['getcode <url>']
handler.tags = ['tools']
handler.command = /^getcode$/i
module.exports = handler