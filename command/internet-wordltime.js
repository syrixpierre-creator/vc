/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const cheerio = ((__i)=>__i&&__i.default?__i.default:__i)(require('cheerio'));
const moment = ((__i)=>__i&&__i.default?__i.default:__i)(require('moment-timezone'));

const handler = async (m, { conn }) => {
    try {
        const Abcd = await waktu();
        let pesan = "*🌍 World Time Information*\n\n";

        const Bell = Abcd.sort((a, b) => {
            const zonaA = moment.tz(a.kota, 'UTC').utcOffset();
            const zonaB = moment.tz(b.kota, 'UTC').utcOffset();
            return zonaA - zonaB;
        });

        Bell.forEach(kota => {
            pesan += `${kota.bndera} *${kota.kota}*: ${kota.waktu}\n`;
        });

        await m.reply(pesan);
    } catch (error) {
        console.error("Kesalahan dalam mengambil waktu dunia:", error);
        await m.reply("Sorry, cannot mengambil informasi time saat this.");
    }
};

async function waktu() {
    const Abella = 'https://onlinealarmkur.com/world/id/';
    try {
        const { data } = await axios.get(Abella);
        const $ = cheerio.load(data);
        let hasil = [];

        $('.flex.items-center.space-x-3').each((index, element) => {
            const bndera = $(element).find('.avatar .text-2xl').text().trim();
            const kota = $(element).find('.city-name').text().trim();
            const Zona = $(element).find('.city-time').attr('data-tz');

            if (Zona) {
                const Yatta = {
    'Sun': 'Min',
    'Mon': 'Sen',
    'Tue': 'Sel',
    'Wed': 'Rab',
    'Thu': 'Kam',
    'Fri': 'Jum',
    'Sat': 'Sab'
};

const realTime = moment().tz(Zona).format('ddd - HH:mm').replace(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/g, match => Yatta[match]);
                hasil.push({ bndera, kota, waktu: realTime });
            }
        });

        return hasil;
    } catch (error) {
        console.error("Error :", error);
        return [];
    }
}

handler.help = ['worldtime', 'waktuglobal'];
handler.command = ['worldtime', 'waktuglobal'];
handler.tags  = ['internet'];
module.exports = handler;