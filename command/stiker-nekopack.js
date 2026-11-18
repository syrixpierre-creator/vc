/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Fitur : Stiker nekopack
type : plugins esm
sumber : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J

*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));
const { Sticker } = require('wa-sticker-formatter');

let handler = async (m, { conn, command }) => {

  let available = [
    'smug', 'woof', 'gasm', '8ball', 'goose', 'cuddle', 'avatar', 'slap',
    'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug',
    'meow', 'kiss', 'wallpaper', 'tickle', 'spank', 'waifu', 'lewd', 'ngif'
  ]

  if (!available.includes(command)) return m.reply('Kategori not available.')

  let res = await fetch(`https://nekos.life/api/v2/img/${command}`)
  if (!res.ok) throw 'Failed ambil image.'
  let data = await res.json()
  let url = data.url

  let stiker = new Sticker(url, {
    pack: 'Ryo Yamada - MD',
    author: 'By HILMAN',
    type: 'full',
    categories: ['Anime'],
    id: command,
    quality: 70
  })

  let buffer = await stiker.toBuffer()
  await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
}

handler.command = /^(smug|woof|gasm|8ball|goose|cuddle|avatar|slap|v3|pat|gecg|feed|fox_girl|lizard|neko|hug|meow|kiss|wallpaper|tickle|spank|waifu|lewd|ngif)$/i
handler.tags = ['sticker']
handler.help = ['smug', 'woof', 'gasm', '8ball', 'goose', 'cuddle', 'avatar', 'slap', 'v3', 'pat', 'gecg', 'feed', 'fox_girl', 'lizard', 'neko', 'hug', 'meow', 'kiss', 'wallpaper', 'tickle', 'spank', 'waifu', 'lewd', 'ngif']
module.exports = handler