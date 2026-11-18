/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const { createHash } = require('crypto');
const moment = ((__i)=>__i&&__i.default?__i.default:__i)(require('moment-timezone'));

let Reg = /^([\w\s]+)\s*[,.|:\/-]\s*(\d{1,3})$/i

let handler = async (m, { text, usedPrefix, command, conn }) => {
  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')

  if (user.registered) {
    return m.reply(`🍓 You already terdaftar di QUEEN AKUMA\n\nKetik:\n${usedPrefix}unreg ${sn}`)
  }

  if (!Reg.test(text)) {
    return m.reply(`🍰 Format salah

Contoh:
${usedPrefix + command} anya,17

Gunakan format yang benar`)
  }

  let [_, name, ageStr] = text.match(Reg)
  name = name.trim()
  let age = parseInt(ageStr)

  if (!name || !age) return m.reply('🍓 Name or umur invalid')
  if (name.length > 100) return m.reply('🍰 Nama maksimal 100 karakter')
  if (age < 5 || age > 100) return m.reply('🍡 Umur harus 5 - 100')

  let d = new Date()
  let week = d.toLocaleDateString('id', { weekday: 'long' })
  let date = d.toLocaleDateString('id', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  let time = moment.tz('Asia/Jakarta').format('HH:mm:ss')

  user.name = name
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  let caption = `
🍓 PENDAFTARAN BERHASIL 🍓

🍰 Nama : ${name}
🍡 Umur : ${age}
🍧 SN   : ${sn}

🍥 Tanggal : ${week}, ${date}
🧃 Waktu   : ${time}

✨ Data berhasil disimpan di QUEEN AKUMA
`.trim()

  await conn.sendMessage(m.chat, {
    image: {
      url: require('../lib/botImage').BOT_IMAGE
    },
    caption,
    footer: '❀ ANYA MD ❀',

    optionText: 'Pilih Menu',
    optionTitle: 'Daftar',

    nativeFlow: [
      {
        text: 'Menu',
        sections: [
          {
            title: 'Main',
            rows: [
              {
                title: 'Menu Utama',
                id: '.menu'
              }
            ]
          }
        ]
      },
      {
        text: 'Copy SN',
        copy: sn
      }
    ]

  }, { quoted: m })
}

handler.help = ['daftar nama,umur']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i
module.exports = handler