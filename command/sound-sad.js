/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { conn, args }) => {
  const sadNumber = parseInt(args[0] || '', 10)

  if (isNaN(sadNumber) || sadNumber < 1 || sadNumber > 34) {
    throw 'Enter nomor antara 1 and 34\nContoh: .sad 2'
  }

  const sadQuotes = [
    '🥀 Kadang that paling menyakitkan adalah berpura-pura baik-baik saja.',
    '🌧️ Not all luka terlihat, not all tangis terdengar.',
    '💔 Beberapa orang hadir hanya for menjadi kenangan.',
    '🕊️ Aku belajar melepaskan meski hati not yet siap.',
    '🌙 Malam selalu tahu what that failed disembunyikan senyum.',
    '🍂 That pergi not yet tentu wrong, that bertahan not yet tentu bahagia.',
    '🎭 Tersenyum bukan berarti not terluka.',
    '☔ Hujan mengajarkan bahwa not all that jatuh will kembali.',
    '🫀 There is rindu that memilih diam daripada mengganggu.',
    '🌑 Kadang menghilang lebih mudah daripada menjelaskan perasaan.',
    '🍃 Kenangan not pernah correct-correct pergi.',
    '🌊 That tenggelam bukan tubuhku, melainkan harapanku.',
    '🖤 Beberapa luka hanya bisa disimpan, bukan diceritakan.',
    '✨ Aku baik-baik saja, kata kebohongan that paling sering diucapkan.',
    '🌹 Cinta that tulus kadang berakhir with perpisahan.'
  ]

  const randomQuote =
    sadQuotes[Math.floor(Math.random() * sadQuotes.length)]

  const audioUrl = `https://github.com/Rangelofficial/Sad-Music/raw/main/audio-sad/sad${sadNumber}.mp3`

  const res = await fetch(audioUrl)
  if (!res.ok) throw 'Failed mengunduh audio.'

  const audioBuffer = Buffer.from(await res.arrayBuffer())

  const thumbUrl = 'https://files.catbox.moe/y5b7l6.jpg'
  const thumb = (
    await axios.get(thumbUrl, {
      responseType: 'arraybuffer'
    })
  ).data

  await conn.sendMessage(
    m.chat,
    {
      text: `https://github.com/hamm-r/${'\u2063'.repeat(500)}

🎧 *Sad Music #${sadNumber}*

${randomQuote}`,
      linkPreview: {
        'matched-text': 'https://github.com/hamm-r',
        title: '🎧 Sad Music',
        description: randomQuote,
        previewType: 0,
        jpegThumbnail: thumb
      }
    },
    { quoted: m }
  )

  await conn.sendMessage(
    m.chat,
    {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false
    },
    { quoted: m }
  )
}

handler.help = ['sad <nomor>']
handler.tags = ['sound']
handler.command = /^sad$/i
handler.limit = true
module.exports = handler