const { renderCalendarCard } = require('../lib/canvasRender');
// import { fakeSender } from '../lib/messageConfig.js';
// import config from '../config.js';
// import https from 'https';
// import { renderCalendarCard } from '../lib/canvasRender.js';

//  country/region → { timezone, city-for-weather }
const REGIONS = {
    nigeria:        { tz: 'Africa/Lagos',        city: 'Lagos',        country: 'Nigeria' },
    lagos:          { tz: 'Africa/Lagos',        city: 'Lagos',        country: 'Nigeria' },
    ghana:          { tz: 'Africa/Accra',        city: 'Accra',        country: 'Ghana' },
    kenya:          { tz: 'Africa/Nairobi',      city: 'Nairobi',      country: 'Kenya' },
    southafrica:    { tz: 'Africa/Johannesburg', city: 'Johannesburg', country: 'South Africa' },
    egypt:          { tz: 'Africa/Cairo',        city: 'Cairo',        country: 'Egypt' },
    america:        { tz: 'America/New_York',    city: 'New York',     country: 'United States' },
    usa:            { tz: 'America/New_York',    city: 'New York',     country: 'United States' },
    unitedstates:   { tz: 'America/New_York',    city: 'New York',     country: 'United States' },
    newyork:        { tz: 'America/New_York',    city: 'New York',     country: 'United States' },
    losangeles:     { tz: 'America/Los_Angeles', city: 'Los Angeles',  country: 'United States' },
    chicago:        { tz: 'America/Chicago',     city: 'Chicago',      country: 'United States' },
    canada:         { tz: 'America/Toronto',     city: 'Toronto',      country: 'Canada' },
    toronto:        { tz: 'America/Toronto',     city: 'Toronto',      country: 'Canada' },
    brazil:         { tz: 'America/Sao_Paulo',   city: 'Sao Paulo',    country: 'Brazil' },
    mexico:         { tz: 'America/Mexico_City', city: 'Mexico City',  country: 'Mexico' },
    uk:             { tz: 'Europe/London',       city: 'London',       country: 'United Kingdom' },
    unitedkingdom:  { tz: 'Europe/London',       city: 'London',       country: 'United Kingdom' },
    england:        { tz: 'Europe/London',       city: 'London',       country: 'United Kingdom' },
    london:         { tz: 'Europe/London',       city: 'London',       country: 'United Kingdom' },
    france:         { tz: 'Europe/Paris',        city: 'Paris',        country: 'France' },
    germany:        { tz: 'Europe/Berlin',       city: 'Berlin',       country: 'Germany' },
    italy:          { tz: 'Europe/Rome',         city: 'Rome',         country: 'Italy' },
    spain:          { tz: 'Europe/Madrid',       city: 'Madrid',       country: 'Spain' },
    russia:         { tz: 'Europe/Moscow',       city: 'Moscow',       country: 'Russia' },
    india:          { tz: 'Asia/Kolkata',        city: 'Mumbai',       country: 'India' },
    pakistan:       { tz: 'Asia/Karachi',        city: 'Karachi',      country: 'Pakistan' },
    china:          { tz: 'Asia/Shanghai',       city: 'Beijing',      country: 'China' },
    japan:          { tz: 'Asia/Tokyo',          city: 'Tokyo',        country: 'Japan' },
    tokyo:          { tz: 'Asia/Tokyo',          city: 'Tokyo',        country: 'Japan' },
    southkorea:     { tz: 'Asia/Seoul',          city: 'Seoul',        country: 'South Korea' },
    uae:            { tz: 'Asia/Dubai',          city: 'Dubai',        country: 'United Arab Emirates' },
    dubai:          { tz: 'Asia/Dubai',          city: 'Dubai',        country: 'United Arab Emirates' },
    saudiarabia:    { tz: 'Asia/Riyadh',         city: 'Riyadh',       country: 'Saudi Arabia' },
    indonesia:      { tz: 'Asia/Jakarta',        city: 'Jakarta',      country: 'Indonesia' },
    singapore:      { tz: 'Asia/Singapore',      city: 'Singapore',    country: 'Singapore' },
    philippines:    { tz: 'Asia/Manila',         city: 'Manila',       country: 'Philippines' },
    australia:      { tz: 'Australia/Sydney',    city: 'Sydney',       country: 'Australia' },
    newzealand:     { tz: 'Pacific/Auckland',    city: 'Auckland',     country: 'New Zealand' },
};

function lookupRegion(query) {
    const key = String(query || '').toLowerCase().replace(/[^a-z]/g, '');
    return REGIONS[key] || null;
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'curl/8' }, timeout: 8000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
    });
}

async function fetchWeather(city) {
    try {
        const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
        const raw = await httpGet(url);
        const data = JSON.parse(raw);
        const cur = data?.current_condition?.[0];
        if (!cur) return null;
        return {
            tempC:       parseInt(cur.temp_C, 10) || 0,
            condition:   cur.weatherDesc?.[0]?.value || '',
            humidity:    parseInt(cur.humidity, 10) || 0,
            windKph:     parseInt(cur.windspeedKmph, 10) || 0,
            weatherCode: parseInt(cur.weatherCode, 10) || 0,
        };
    } catch (_) {
        return null;
    }
}

function tzAbbrevOffset(tz, now) {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, timeZoneName: 'shortOffset',
        }).formatToParts(now);
        const off = parts.find(p => p.type === 'timeZoneName')?.value || '';
        return off;
    } catch (_) {
        return '';
    }
}

module.exports = {
    command: 'calendar',
    aliases: ['cal', 'kalender'],
    category: 'utility',
    description: 'Show a live calendar card — date, time, region, weather',
    usage: '.calendar [country]',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config.botName || '★彡 [ QUEEN AKUMA] 彡★';

        const query = args.join(' ').trim();
        let region;

        if (query) {
            region = lookupRegion(query);
            if (!region) {
                const sample = ['Nigeria', 'America', 'UK', 'India', 'Japan', 'Ghana', 'Canada', 'Dubai'];
                await sock.sendMessage(chatId, {
                    text: `❌ Unknown country/region: "${query}"\n\nTry one of: ${sample.join(', ')}, etc.\n_Usage: .calendar [country]_`
                }, { quoted: fakeSender });
                return;
            }
        } else {
            region = REGIONS.nigeria;
        }

        const { tz, city, country } = region;
        const now = new Date();

        //  date/time breakdown
        const weekday  = now.toLocaleString('en-US', { timeZone: tz, weekday: 'long' });
        const monthName = now.toLocaleString('en-US', { timeZone: tz, month: 'long' });
        const dayNum   = parseInt(now.toLocaleString('en-US', { timeZone: tz, day: 'numeric' }), 10);
        const yearNum  = parseInt(now.toLocaleString('en-US', { timeZone: tz, year: 'numeric' }), 10);
        const monthIdx = parseInt(now.toLocaleString('en-US', { timeZone: tz, month: 'numeric' }), 10) - 1;
        const timeStr  = now.toLocaleString('en-US', {
            timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        });
        const fullDate = `${weekday}, ${dayNum} ${monthName} ${yearNum}`;
        const offset   = tzAbbrevOffset(tz, now);
        const tzLabel  = offset ? `${tz} (${offset})` : tz;

        // week number + day-of-year
        const localApprox = new Date(yearNum, monthIdx, dayNum);
        const dayOfYear = Math.floor((localApprox - new Date(yearNum, 0, 0)) / 86400000);
        const weekNum = Math.ceil(dayOfYear / 7);
        const daysInYear = ((yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0) ? 366 : 365;

        //  weather (best-effort)
        const weather = await fetchWeather(city);

        //  render calendar card
        try {
            const buffer = await renderCalendarCard({
                botName:   botName,
                year:      yearNum,
                monthIdx,
                monthName,
                todayDate: dayNum,
                weekday,
                fullDate,
                timeStr,
                timezone:  tzLabel,
                region:    city,
                country,
                weekNum,
                dayOfYear,
                daysInYear,
                ...(weather ? {
                    tempC:       weather.tempC,
                    condition:   weather.condition,
                    humidity:    weather.humidity,
                    windKph:     weather.windKph,
                    weatherCode: weather.weatherCode,
                } : {}),
            });

            const caption = `🗓️ *${monthName} ${yearNum} — ${city}, ${country}*\n` +
                `${weekday} · ${timeStr} (${tzLabel})` +
                (weather ? `\n${weather.condition}, ${weather.tempC}°C` : '');

            await sock.sendMessage(chatId, {
                image: buffer,
                caption,
                mimetype: 'image/png',
            }, { quoted: fakeSender });
            return;
        } catch (e) {
            console.error('[calendar] Canvas render failed:', e.message);
        }

        //  text fallback
        await sock.sendMessage(chatId, {
            text: ` ⟮ 🗓️ ${botName} ⟯⊷
 *CALENDAR*

 📅 ${fullDate}
 🕐 ${timeStr} (${tzLabel})
 📍 ${city}, ${country}
 📆 Week ${weekNum} · Day ${dayOfYear}/${daysInYear}
 ${weather ? `🌤️ ${weather.condition}, ${weather.tempC}°C` : ''}
⊷

_⚡ Powered by ${botName}_`
        }, { quoted: fakeSender });
    }
};