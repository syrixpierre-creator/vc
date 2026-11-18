/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { text }) => {
  const nama = text || m.pushName || 'Kamu'

  const ramalan = [
    '💸 Will jadi sultan dadakan from giveaway that gak sengaja diikutin.',
    '💔 Akan ditikung sahabat sendiri, tapi tetap ikhlas karena jodoh gak ke mana.',
    '🛌 You will tidur 14 hour and bangun tetap capek.',
    '📱 HP you will jatuh tapi nggak lecet. Cuma mental you that retak.',
    '🎓 You will lulus... from hubungan tanpa kejelasan.',
    '📉 Akan investasi kripto, tapi malah beli token tipu-tipu.',
    '🛍️ You will belanja banyak, tapi lupa bayar listrik.',
    '👽 Alien bakal culik you because mengira you spesies langka.',
    '💘 Will jatuh cinta sama orang that ngira you bot.',
    '😂 You will ketawa day this gara-gara baca message this.'
  ]

  const hasil = ramalan[Math.floor(Math.random() * ramalan.length)]
  m.reply(`🔮 *Ramalan Masa Depan*\n\n${nama}, ${hasil}`)
}

handler.help = ['ramal <nama opsional>']
handler.tags = ['fun']
handler.command = /^ramal$/i
handler.limit = false
module.exports = handler