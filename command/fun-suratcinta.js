/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { text }) => {
  if (!text) return m.reply('💌 Enter name orang that mau you kirimi surat cinta palsu.\n\nContoh: .suratcinta Hilman')

  const target = text
  const pembuka = [
    `Untukmu that selalu hadir in lamunanku, ${target},`,
    `Dear ${target},`,
    `Kepada ${target} that diam-diam kucintai,`,
    `Hai ${target}, bintang di langit malamku,`,
    `Wahai ${target}, pemilik senyum that menghancurkan dompetku,`
  ]

  const isi = [
    `Setiap kali aku melihat status-mu, hatiku bergetar seperti sinyal WiFi tetangga.`,
    `Kau hadir dalam hidupku bagaikan notif Shopee di tengah malam, mengejutkan tapi bikin senang.`,
    `Aku tau you bukan SPBU, tapi kenapa you selalu ngisi hatiku?`,
    `Kalau cinta that buta, maka aku already lama tersesat di labirin wajahmu.`,
    `Tanpamu hidupku seperti Indomie tanpa micin, hambar dan menyedihkan.`
  ]

  const penutup = [
    `Salam terhangat, from seseorang that bahkan you gak save nomornya.`,
    `From aku, that hanya can memandangmu from status WhatsApp.`,
    `With penuh cinta palsu,`,
    `That mencintaimu in diam and chat that tak pernah you reply to.`,
    `Sekian, sebelum you buang surat this ke spam.`
  ]

  const surat = `${pick(pembuka)}\n\n${pick(isi)}\n\n${pick(penutup)}`
  m.reply(`💌 *Surat Cinta Palsu*\n\n${surat}`)
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

handler.help = ['suratcinta <nama>']
handler.tags = ['fun']
handler.command = /^suratcinta$/i
handler.limit = false
module.exports = handler