/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/**
 @ ✨ AnichinSeries
 @ ✨ Source : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
@ ✨ Scrape: https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/2174
**/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = require('cheerio');

const handler = async (m, { text, command }) => {
  if (!text) return m.reply(`Example:\n${command} https://anichin.top/anime/kaijuu-8-gou/`)
  try {
    const res = await axios.get(text)
    const $ = cheerio.load(res.data)

    let title = $('.bigcontent .infox .entry-title').text()
    let type = $('.info-content .spe span:contains("Type:")').text().replace('Type:', '').trim()
    let genre = $('.genxed a').map((i, el) => $(el).text()).get().join(', ')
    let status = $('.info-content .spe span:contains("Status:")').text().replace('Status:', '').trim()
    let synopsis = $('.entry-content[itemprop="description"] p').text()
    let episodes = $('.eplister ul li').map((i, el) => {
      let num = $(el).find('.epl-num').text()
      let sub = $(el).find('.epl-sub').text()
      let date = $(el).find('.epl-date').text()
      let link = $(el).find('a').attr('href')
      return `🎞️ *${num}* - ${sub} (${date})\n🔗 ${link}`
    }).get().join('\n\n')

    let teks = `📺 *${title}*\n\n🎞️ Type: ${type}\n📂 Status: ${status}\n📁 Genre: ${genre}\n\n📝 *Sinopsis:*\n${synopsis}\n\n${episodes}`
    m.reply(teks)
  } catch (e) {
    console.log(e)
    m.reply('Failed mengambil data. Pastikan URL correct.')
  }
}

handler.command = ['anichinseri']
handler.help = ['anichinseri <url>']
handler.tags = ['anime']
handler.limit = true
handler.register = true
module.exports = handler