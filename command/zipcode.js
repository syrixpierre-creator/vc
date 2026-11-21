'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .zipcode (raganork port).
 * Indian PIN code lookup. QUEEN AKUMA ka .pincode stub tha — ye real hai.
 * Source 1: api.postalpincode.in — Source 2: api.zippopotam.us
 */
const axios = require('axios');

async function fromPostalPin(pin) {
  const res = await axios.get('https://api.postalpincode.in/pincode/' + pin, { timeout: 15000 });
  const d = (res.data && res.data[0]) || {};
  if (d.Status !== 'Success' || !d.PostOffice || !d.PostOffice.length) throw new Error('PIN not found');
  return d.PostOffice.map((p) => ({
    name: p.Name, district: p.District, state: p.State, division: p.Division, block: p.Block
  }));
}

async function fromZippopotam(pin) {
  const res = await axios.get('https://api.zippopotam.us/in/' + pin, { timeout: 15000 });
  const d = res.data || {};
  if (!d.places || !d.places.length) throw new Error('PIN not found');
  return d.places.map((p) => ({
    name: p['place name'], district: '', state: p.state, division: '', block: ''
  }));
}

module.exports = {
  command: 'zipcode',
  aliases: ['pincode2', 'pininfo'],
  description: 'Indian PIN code ki details nikalo.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const pin = String((args || [])[0] || '').trim();
    if (!/^\d{6}$/.test(pin)) {
      await reply('❌ 6-digit PIN do.\nExample: *.zipcode 110001*');
      return;
    }
    let offices = null, lastErr = null;
    try { offices = await fromPostalPin(pin); }
    catch (e) { lastErr = e; try { offices = await fromZippopotam(pin); } catch (e2) { lastErr = e2; } }
    if (!offices) {
      await reply('❌ PIN ' + pin + ' not found: ' + String((lastErr && lastErr.message) || lastErr).slice(0, 100));
      return;
    }
    const lines = offices.slice(0, 8).map((o, i) =>
      (i + 1) + '. *' + o.name + '*' + (o.district ? ' — ' + o.district : '') + ', ' + o.state + (o.division ? ' (' + o.division + ')' : ''));
    await reply('📮 *PIN ' + pin + '*\n\n' + lines.join('\n') + (offices.length > 8 ? '\n...aur ' + (offices.length - 8) + ' post offices' : ''));
  }
};
