/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

const handler = async (m, { conn, text }) => {
  const args = text ? text.split(' ') : []
  if (!args.length) return conn.reply(m.chat, 'Enter keyword search!\nContoh: .sfilesearch axis game', m)

  const query = encodeURIComponent(args.join(' '))
  const apiUrl = `https://api.nekorinn.my.id/search/sfile?q=${query}`

  try {
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Failed mengambil data.')

    const json = await res.json()
    if (!json.status || !json.result.length) {
      return conn.reply(m.chat, 'File not found.', m)
    }

    let teks = `*Result search for:* ${args.join(' ')}\n\n`
    json.result.slice(0, 10).forEach((v, i) => {
      teks += `${i + 1}. *${v.title.trim()}*\nSize: ${v.size}\nLink: ${v.url}\n\n`
    })

    conn.reply(m.chat, teks, m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, 'An error occurred saat searching file.', m)
  }
}

handler.help = ['sfilesearch']
handler.tags = ['search']
handler.command = ['sfilesearch']
handler.register = true
module.exports = handler