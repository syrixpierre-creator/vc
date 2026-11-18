/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));
const cheerio = ((__i)=>__i&&__i.default?__i.default:__i)(require('cheerio'));

// Ini Scrape Nya
async function fetchMangaList() {
    try {
        const url = "https://natsu.id";
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed mengambil data from ${url}, status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const mangaList = [];

        $(".listupd.popularslider .bs").each((_, element) => {
            const title = $(element).find(".bigor .tt").text().trim();
            const chapter = $(element).find(".bigor .epxs").text().trim();
            const rating = $(element).find(".bigor .numscore").text().trim();
            const link = $(element).find("a").attr("href");
            const image = $(element).find("img").attr("src");

            if (title && link) {
                mangaList.push({
                    title,
                    chapter,
                    rating,
                    link,
                    image,
                });
            }
        });

        return mangaList;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}
//Batas Scrape

const handler = async (m, { conn }) => {
    m.reply('Please Wait....');
    const mangaList = await fetchMangaList();

    if (mangaList.length === 0) {
        return m.reply('❌ Failed mengambil daftar manga. Please try again nanti.');
    }

    for (const manga of mangaList.slice(0, 5)) { //Max Mengirim 5 (Ubah Sendiri Juga Bisa)
        const caption = `
📖 *${manga.title}*
📄 Chapter: ${manga.chapter}
⭐ Rating: ${manga.rating || 'N/A'}
🔗 Link: ${manga.link}
        `.trim();


        await conn.sendMessage(
            m.chat,
            {
                image: { url: manga.image },
                caption: caption,
            },
            { quoted: m }
        );
    }

    m.reply('');
};

handler.help = ['mangga-pop'].map(v => v + ' ');
handler.command = /^mangalist$/i;
handler.tags = ["internet"]
handler.limit = false;
module.exports = handler;