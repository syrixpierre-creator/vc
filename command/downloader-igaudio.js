/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
`[Instagram audio]`
type : plugins esm
sumber scrape:
https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/385
*/
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const qs = ((__i)=>__i&&__i.default?__i.default:__i)(require('querystring'));

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Example: ${usedPrefix + command} https://www.instagram.com/reels/audio/183824252336459/`)

  let url = args[0]
  if (!/^https?:\/\/(www\.)?instagram\.com\/reels\/audio\/\d+/.test(url)) return m.reply('URL audio reels Instagram invalid.')

  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest'
    }

    const home = await axios.get('https://saveinsta.to/')
    const k_token = home.data.match(/k_token\s*=\s*['"]([^'"]+)['"]/)?.[1]
    if (!k_token) throw '❌ Failed ambil token'

    const verifyRes = await axios.post('https://saveinsta.to/api/userverify', qs.stringify({ url }), { headers })
    const cftoken = verifyRes.data?.token
    if (!cftoken) throw '❌ Token verifikasi not found'

    const payload = qs.stringify({
      k_exp: Math.floor(Date.now() / 1000) + 300,
      k_token,
      q: url,
      t: 'media',
      lang: 'en',
      v: 'v2',
      cftoken
    })

    const searchRes = await axios.post('https://saveinsta.to/api/ajaxSearch', payload, { headers })
    const html = searchRes.data?.data
    if (!html) throw '❌ No result data'

    const rawLink = html.match(/<a href="([^"]+)"[^>]*title="Download Audio"/)?.[1]
    const filename = html.match(/"filename":"([^"]+\.mp4)"/)?.[1] || html.match(/\/([^\/?#]+\.mp4)/)?.[1]
    if (!rawLink) throw '❌ Link audio not found'

    const mp3Link = 'https://mp3.videodropper.app/api?url=' + encodeURIComponent(rawLink)

    await conn.sendMessage(m.chat, {
      audio: { url: mp3Link },
      mimetype: 'audio/mp4',
      fileName: filename || 'Fiony_Audio.mp4',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Failed download audio.\n' + e)
  }
}

handler.help = ['instaaudio', 'igaudio']
handler.tags = ['downloader']
handler.command = /(instaaudio|igaudio|inastagramaudio)$/i
handler.limit = true
module.exports = handler