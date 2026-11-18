// import axios from 'axios';
// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';

async function geocode(query) {
    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { q: query, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'QUEEN-AKUMA-Bot/3.5.0' }
        });
        if (res.data && res.data.length > 0) {
            return {
                lat: parseFloat(res.data[0].lat),
                lon: parseFloat(res.data[0].lon),
                display_name: res.data[0].display_name
            };
        }
    } catch (e) {
        console.error('[geocode error]', e.message);
    }
    return null;
}

module.exports = {
    command: 'location',
    aliases: ['loc', 'whereis'],
    category: 'utility',
    description: 'Get location information for a given place',
    usage: '.location <Location Name>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';
        const query = args.join(' ').trim();

        if (!query) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ 📍 ${botName} ⟯⊷
 *LOCATION FINDER*

 *Usage:*
 .location <Location Name>

 *Example:*
 .location Lagos
 .location Eiffel Tower
 .location London
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: fakeSender });
            return;
        }

        // Send reaction
        await sock.sendMessage(chatId, {
            react: { text: '📍', key: message.key }
        }).catch(() => {});

        const geo = await geocode(query);

        if (!geo) {
            await sock.sendMessage(chatId, {
                text: `❌ Could not find location: ${query}`
            }, { quoted: fakeSender });
            return;
        }

        const caption = ` ⟮ 📍 ${botName} ⟯⊷
 *LOCATION FOUND*

 📍 *${geo.display_name}*

 📐 *Latitude:* ${geo.lat}
 📐 *Longitude:* ${geo.lon}
⊷

_⚡ Powered by ${botName}_`;

        // Generate a static map image for the location
        const mapUrl = `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${geo.lon},${geo.lat}&z=15&l=map&pt=${geo.lon},${geo.lat},pm2rdm`;

        try {
            await sock.sendMessage(chatId, {
                image: { url: mapUrl },
                caption: caption
            }, { quoted: fakeSender });
        } catch (err) {
            console.error('[location] image send error:', err.message);
            await sock.sendMessage(chatId, {
                text: caption
            }, { quoted: fakeSender });
        }
    }
};