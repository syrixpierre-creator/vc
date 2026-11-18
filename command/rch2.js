/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/**
 *  Name   : React Channel V2
 *  Version: 2.0
 *  API    : api-faa.my.id
 *  Command: .rch <url> [emoji]
 */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

const API_URL = 'https://api-faa.my.id/faa/react-channel'
const API_KEY = 'faa-ganteng-sekali'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `❌ *Example usage:*\n\n` +
      `${usedPrefix + command} https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J... 🔥❤️🤍🫰`
    )
  }

  // Ambil URL WhatsApp Channel
  const urlMatch = text.match(/https?:\/\/whatsapp\.com\/channel\/[^\s]+/i)

  if (!urlMatch) {
    return m.reply('❌ URL WhatsApp Channel invalid!')
  }

  const url = urlMatch[0]

  // Ambil emoji setelah URL
  const reactText = text
    .replace(url, '')
    .trim()

  const react = reactText || '🔥❤️🤍🫰'

  await m.reply(
    `⏳ *Memproses reaction...*\n\n` +
    `🔗 *Target:* ${url}\n` +
    `💫 *Reaction:* ${react}`
  )

  try {
    const { data } = await axios.get(API_URL, {
      params: {
        url,
        react,
        apikey: API_KEY
      },
      timeout: 60000
    })

    // Normalisasi response API
    const success =
      data?.success === true ||
      data?.status === true ||
      data?.status === 'success' ||
      data?.code === 200

    if (!success) {
      const message =
        data?.message ||
        data?.msg ||
        data?.error ||
        'Reaction failed diproses.'

      return m.reply(
        `❌ *REACTION Failed!*\n\n` +
        `🔗 *Target:* ${url}\n` +
        `💫 *Reaction:* ${react}\n` +
        `📄 *Response:* ${message}`
      )
    }

    await m.reply(
      `✅ *REACTION Success!*\n\n` +
      `🔗 *Target:* ${url}\n` +
      `💫 *Reaction:* ${react}\n` +
      `📡 *Status:* Success dikirim`
    )

  } catch (e) {
    console.error('RCH V2 ERROR:', e)

    let msg = e?.response?.data?.message ||
              e?.response?.data?.msg ||
              e?.message ||
              'An error occurred pada server API.'

    if (typeof msg === 'object') {
      msg = JSON.stringify(msg)
    }

    return m.reply(
      `❌ *REACTION ERROR!*\n\n` +
      `🔗 *Target:* ${url}\n` +
      `💫 *Reaction:* ${react}\n` +
      `📄 *Error:* ${msg}`
    )
  }
}

handler.help = ['rch2']
handler.tags = ['tools']
handler.command = ['rch2', 'reactchannel2', 'reactch2']
module.exports = handler