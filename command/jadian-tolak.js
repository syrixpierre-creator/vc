/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const createUser = (jid) => {
  const users = global.db.data.users

  if (!users[jid]) users[jid] = {}

  if (!users[jid].relationship) {
    users[jid].relationship = {
      pasangan: '',
      pending: '',
      dari: '',
      sejak: 0
    }
  }

  return users[jid]
}

const tag = jid => '@' + jid.split('@')[0]

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const kataTolak = [
  '💔 Sorry... sepertinya we cukup jadi teman saja.',
  '🥲 Jangan menyerah, mungkin jodohmu bukan dia.',
  '😔 Yahh... cintamu not yet diterima.',
  '💙 Tetap semangat ya, masih banyak that lain.',
  '🌹 Terima kasih already berani mengungkapkan perasaanmu.'
]

let handler = async (m, { conn }) => {
  let user = createUser(m.sender)

  if (!user.relationship.dari)
    return m.reply('❌ No that currently menembak you.')

  let penembak = user.relationship.dari
  let target = createUser(penembak)

  user.relationship.dari = ''

  if (
    target.relationship.pending &&
    target.relationship.pending === m.sender
  ) {
    target.relationship.pending = ''
  }

  conn.reply(
    m.chat,
    `💔 *TEMBAKAN DITOLAK!*\n\n` +
    `${tag(m.sender)} menolak perasaan ${tag(penembak)}.\n\n` +
    `${pick(kataTolak)}`,
    m,
    {
      mentions: [m.sender, penembak]
    }
  )
}

handler.help = ['tolak']
handler.tags = ['fun']
handler.command = /^tolak$/i
handler.group = true
module.exports = handler