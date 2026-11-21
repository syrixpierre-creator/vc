'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .population (YESSER port).
 * Kisi country ki population nikalo.
 * Source 1: restcountries.com (population + capital + region, no key).
 * Source 2: World Bank API (latest SP.POP.TOTL).
 */
const axios = require('axios');

async function fromRestCountries(name) {
  const res = await axios.get('https://restcountries.com/v3.1/name/' + encodeURIComponent(name) + '?fields=name,population,capital,region,cca2', { timeout: 15000 });
  const d = (res.data && res.data[0]) || {};
  if (!d.population) throw new Error('Country not found');
  return {
    name: (d.name && d.name.common) || name, population: d.population,
    capital: (d.capital || []).join(', ') || '—', region: d.region || '—', cca2: d.cca2 || ''
  };
}

async function fromWorldBank(cca2) {
  const res = await axios.get('https://api.worldbank.org/v2/country/' + cca2 + '/indicator/SP.POP.TOTL?format=json&date=2020:2024&per_page=5', { timeout: 15000 });
  const rows = (res.data && res.data[1]) || [];
  const latest = rows.find((r) => r && r.value);
  if (!latest) throw new Error('No data from World Bank');
  return { population: latest.value, year: latest.date };
}

module.exports = {
  command: 'population',
  aliases: ['pop', 'countrypop'],
  description: 'Kisi country ki population dikhao.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const name = (args || []).join(' ').trim();
    if (!name) {
      await reply('❌ Country ka naam do.\nExample: *.population India*');
      return;
    }
    let info = null, lastErr = null;
    try { info = await fromRestCountries(name); }
    catch (e) { lastErr = e; }
    if (!info) {
      await reply('❌ *Country not found:* *' + name + '* — ' + String((lastErr && lastErr.message) || lastErr).slice(0, 100));
      return;
    }
    let wbNote = '';
    if (info.cca2) {
      try {
        const wb = await fromWorldBank(info.cca2);
        wbNote = '\n🏦 World Bank (' + wb.year + '): ' + Number(wb.population).toLocaleString('en-IN');
      } catch (e) {}
    }
    await reply('🌍 *' + info.name + '*\n\n' +
      '👥 Population: ' + Number(info.population).toLocaleString('en-IN') + '\n' +
      '🏛️ Capital: ' + info.capital + '\n' +
      '🗺️ Region: ' + info.region + wbNote);
  }
};
