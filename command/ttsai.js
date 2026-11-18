/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
`[TTS AI model/random]`
type : plugins esm
API : https://zenzxz.dpdns.org
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Example:\n${usedPrefix + command} miku | Halo\natau:\n${usedPrefix + command} random | Halo\natau:\n${usedPrefix + command} list`

  if (text.toLowerCase() == 'list') {
    let hasil = `*🎙️ List Model Text to Speech:*\n\n`
    hasil += `• miku — Hatsune Miku\n`
    hasil += `• nahida — Nahida (Exclusive)\n`
    hasil += `• nami — Nami\n`
    hasil += `• ana — Ana (Female)\n`
    hasil += `• optimus_prime — Optimus Prime\n`
    hasil += `• goku — Goku\n`
    hasil += `• taylor_swift — Taylor Swift\n`
    hasil += `• elon_musk — Elon Musk\n`
    hasil += `• mickey_mouse — Mickey Mouse\n`
    hasil += `• kendrick_lamar — Kendrick Lamar\n`
    hasil += `• angela_adkinsh — Angela Adkinsh\n`
    hasil += `• eminem — Eminem\n\n`
    hasil += `Gunakan:\n${usedPrefix + command} <model/random> | <teks>\nContoh:\n${usedPrefix + command} miku | Halo dunia`

    return await conn.sendMessage(m.chat, { text: hasil }, { quoted: m })
  }

  let [model, teks] = text.split('|').map(v => v.trim())
  if (!model || !teks) throw `Example:\n${usedPrefix + command} miku | Halo\natau:\n${usedPrefix + command} random | Halo\natau:\n${usedPrefix + command} list`

  let res = await fetch(`https://zenzxz.dpdns.org/tools/text2speech?text=${encodeURIComponent(teks)}`)
  if (!res.ok) throw 'Failed mengambil data from API.'

  let json = await res.json()
  if (!json.status) throw 'TTS not available.'

  let suara

  if (model.toLowerCase() == 'random') {
    suara = json.results[Math.floor(Math.random() * json.results.length)]
  } else {
    suara = json.results.find(v => v.model.toLowerCase() == model.toLowerCase())
  }

  if (!suara) {
    let daftarModel = json.results.map(v => v.model).join(', ')
    throw `Model *${model}* not found.\n\nModel that available:\n${daftarModel}`
  }

  await conn.sendMessage(m.chat, {
    audio: { url: suara.audio_url },
    mimetype: 'audio/mp4',
    ptt: false
  }, { quoted: m })

  await conn.sendMessage(m.chat, {
    text: `🎧 *${suara.voice_name}* (model: ${suara.model})`
  }, { quoted: m })
}

handler.help = ['ttsai <model/random/list> | <teks>']
handler.tags = ['tools', 'sound']
handler.command = /^ttsai$/i
handler.limit = true
module.exports = handler