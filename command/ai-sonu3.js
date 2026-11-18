/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw `Enter prompt!\nContoh: ${usedPrefix + command} A woman running`
m.reply('Processing, please tunggu...')
try {
let res = await fetch(`https://omegatech-api.dixonomega.tech/api/ai/sonu3?action=full&prompt=${encodeURIComponent(text)}`)
let json = await res.json()
if (!json.success) throw 'Failed mengambil data from API'
let { title, tags, duration, thumbnail, url, lyrics, source, attribution } = json
let caption = `*SONU 3 AI MUSIC*\n\n`
caption += `*Title:* ${title}\n`
caption += `*Tags:* ${tags}\n`
caption += `*Duration:* ${duration} seconds\n`
caption += `*Source:* ${source}\n`
caption += `*Attribution:* ${attribution}\n\n`
caption += `*Lyrics:*\n${lyrics}`
await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: caption }, { quoted: m })
await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
} catch (e) {
throw 'An error occurred sistem'
}
}

handler.help = ['sonu3']
handler.tags = ['ai']
handler.command = /^(sonu3)$/i
module.exports = handler