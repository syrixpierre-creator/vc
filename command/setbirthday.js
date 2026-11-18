/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { text }) => {
  const db = global.db?.data?.users
  if (!db) return m.reply('❌ DB not found')

  if (!text) {
    return m.reply('❌ Example: setbirthday 25-12-2005')
  }

  const parts = text.split('-').map(Number)

  if (parts.length < 2) {
    return m.reply('❌ Format: DD-MM-YYYY')
  }

  const [d, mth, y] = parts

  if (!d || !mth || d > 31 || mth > 12) {
    return m.reply('❌ Format invalid')
  }

  if (!db[m.sender]) db[m.sender] = {}

  db[m.sender].birthday = y
    ? `${d}-${mth}-${y}`
    : `${d}-${mth}`

  m.reply(`🎉 Birthday tersimpan!\n📅 ${db[m.sender].birthday}`)
}

handler.help = ['setbirthday']
handler.tags = ['info', 'xp']
handler.command = /^setbirthday$/i
module.exports = handler