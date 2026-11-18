/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = ((__i)=>__i&&__i.default?__i.default:__i)(require('cheerio'));

async function PlayStore(search) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await axios.get(`https://play.google.com/store/search?q=${search}&c=apps`)
            const hasil = []
            const $ = cheerio.load(data)

            $('.ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a').each((i, u) => {
                const linkk = $(u).attr('href')
                const nama = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .DdYX5').text()
                const developer = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb').text()
                const rate = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div').attr('aria-label')
                const rate2 = $(u).find('.j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF').text()
                const link = `https://play.google.com${linkk}`

                hasil.push({
                    link: link,
                    nama: nama || 'No name',
                    developer: developer || 'No Developer',
                    img: 'https://files.catbox.moe/dklg5y.jpg',
                    rate: rate || 'No Rate',
                    rate2: rate2 || 'No Rate',
                    link_dev: `https://play.google.com/store/apps/developer?id=${developer.split(" ").join('+')}`
                })
            })

            if (hasil.length === 0) return resolve({ mess: 'No result that found' })

            resolve(hasil.slice(0, Math.max(3, Math.min(5, hasil.length))))
        } catch (err) {
            console.error(err)
            reject(err)
        }
    })
}

const handler = async (m, { conn, text }) => {
    const search = text.trim()
    if (!search) return m.reply('Enter query search!')

    try {
        const results = await PlayStore(search)
        if (results.mess) return m.reply(results.mess)

        let txt = `*🔎 Result Search Play Store for "${search}"*\n\n`
        for (let app of results) {
            txt += `▢ *Nama:* ${app.nama}\n`
            txt += `▢ *Developer:* ${app.developer}\n`
            txt += `▢ *Rating:* ${app.rate2} (${app.rate})\n`
            txt += `▢ *Link:* ${app.link}\n`
            txt += `▢ *Developer Link:* ${app.link_dev}\n\n`
        }

        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                externalAdReply: {
                    title: results[0].nama,
                    body: `Play Store Search Result - ${search}`,
                    thumbnailUrl: 'https://files.catbox.moe/dklg5y.jpg',
                    sourceUrl: results[0].link,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        })
    } catch (e) {
        m.reply('An error occurred saat melakukan search')
    }
}

handler.help = ['playstore'].map(v => v + ' <query>')
handler.command = /^(playstore|ps)$/i
handler.limit = false
handler.tags = ['internet']
module.exports = handler