/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Search Code
Desk : Search code dari https://codeshare.cloudku.click
Type : Plugin ESM
Source Scrape : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/502
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = ((__i)=>__i&&__i.default?__i.default:__i)(require('cheerio'));

async function scrapeCodeSearch(query) {
  const url = `https://codeshare.cloudku.click/?q=${encodeURIComponent(query)}`
  const res = await axios.get(url)
  const $ = cheerio.load(res.data)
  const results = []

  const cards = $('.snippet-card').toArray()

  for (const el of cards) {
    const card = $(el)
    const title = card.find('.card-title a').text().trim()
    const path = card.find('.card-title a').attr('href')
    const link = 'https://codeshare.cloudku.click' + path
    const author = card.find('.card-user .user-info').text().trim()
    const views = parseInt(card.find('.meta-item').first().text().replace(/\D/g, '')) || 0
    const languageIcon = card.find('.meta-item i').attr('class') || ''
    const language = languageIcon.split('-').pop().replace('plain', '') || 'unknown'

    results.push({ title, author, views, language, link })
  }

  return {
    status: 200,
    total: results.length,
    data: results
  }
}

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `Example:\n${usedPrefix + command} downloader tiktok `

  let res = await scrapeCodeSearch(text)
  if (!res.data.length) throw 'No result found.'

  let teks = res.data.slice(0, 5).map((v, i) => {
    return `*${i + 1}. ${v.title}*\n👤 ${v.author}\n💻 ${v.language}\n👁 ${v.views} views\n🔗 ${v.link}`
  }).join`\n\n`

  await m.reply(`🔍 Result search for: *${text}*\n\n${teks}`)
}
handler.help = ['searchcode'].map(v => v + ' <query>')
handler.tags = ['tools']
handler.command = /^searchcode$/i
handler.limit = false
module.exports = handler