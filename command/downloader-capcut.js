/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
Jangan Hapus Wm Bang

*Capcut Download  Plugins Esm*

Iya In aja Lah Meski Gak Tawu

*[Sumber]*
https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J

*[Sumber Scrape]*

https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/102
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = ((__i)=>__i&&__i.default?__i.default:__i)(require('cheerio'));

async function scrapeCapCut(url) {
    if (!url) throw new Error('URL cannot be empty');

    const response = await axios.get(url);
    const data = response.data;
    const $ = cheerio.load(data);

    return {
        videoUrl: $("video").attr("src") || null
    };
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Enter URL CapCut\nContoh: .capcut https://www.capcut.com/templates/7445547192938450229');

    try {
        m.reply('Please wait, processing...');
        const result = await scrapeCapCut(text);

        if (!result.videoUrl) throw new Error('Video not found');

        await conn.sendMessage(m.chat, {
            video: { url: result.videoUrl }
        });

    } catch (error) {
        console.error('Error:', error);
        m.reply('An error occurred saat mengunduh template CapCut');
    }
}

handler.help = ['capcut'];
handler.tags = ['downloader'];
handler.command = /^(capcut)$/i;
handler.limit = false;
module.exports = handler;