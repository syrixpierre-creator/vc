/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { text }) => {
  if (!text) return m.reply('Enter kata kunci')

  let url = 'https://api-faa.my.id/faa/Wikipedia-search?q=' + encodeURIComponent(text)

  let res = await fetch(url)
  if (!res.ok) return m.reply('Failed mengambil data')

  let data = await res.json()
  if (!data?.result?.status) return m.reply('Not found')

  let r = data.result

  let hasil = `📚 *WIKIPEDIA*\n\n`
  hasil += `📌 *Judul:* ${r.title}\n`
  hasil += `🔗 *Link:* ${r.url}\n\n`
  hasil += `📝 *Ringkasan:*\n${r.summary.trim()}`

  if (r.search_results?.length) {
    hasil += `\n\n🔍 *Result Terkait:*`
    r.search_results.slice(0, 3).forEach((v, i) => {
      hasil += `\n${i + 1}. ${v.title}\n   ${v.snippet}`
    })
  }

  m.reply(hasil)
}

handler.help = ['wiki', 'wikipedia']
handler.tags = ['internet']
handler.command = /^(wiki|wikipedia|wikiid)$/i
module.exports = handler