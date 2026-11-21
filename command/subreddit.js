'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .subreddit (QUEEN AKUMA port).
 * Subreddit ki info nikalo.
 * Source 1: api.popcat.xyz/subreddit — Source 2: reddit about.json (no key).
 */
const axios = require('axios');

async function fromPopcat(name) {
  const res = await axios.get('https://api.popcat.xyz/subreddit/' + encodeURIComponent(name), { timeout: 15000 });
  const d = res.data || {};
  if (!d.name) throw new Error('Subreddit not found');
  return {
    name: d.name, title: d.title, members: d.members, active: d.active_users,
    desc: d.description, nsfw: d.nsfw, url: d.url || ('https://www.reddit.com/r/' + name + '/')
  };
}

async function fromReddit(name) {
  const res = await axios.get('https://www.reddit.com/r/' + encodeURIComponent(name) + '/about.json', {
    timeout: 15000,
    headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0' }
  });
  const d = (res.data && res.data.data) || {};
  if (!d.display_name) throw new Error('Subreddit not found');
  return {
    name: d.display_name, title: d.title, members: d.subscribers, active: d.active_user_count,
    desc: d.public_description, nsfw: d.over18, url: 'https://www.reddit.com' + (d.url || ('/r/' + name + '/'))
  };
}

module.exports = {
  command: 'subreddit',
  aliases: ['subred', 'rinfo'],
  description: 'Subreddit ki info dikhao.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const name = String((args || [])[0] || '').trim().replace(/^r\//, '');
    if (!/^[A-Za-z0-9_]{3,21}$/.test(name)) {
      await reply('❌ Subreddit ka naam do.\nExample: *.subreddit memes*');
      return;
    }
    let info = null, lastErr = null;
    try { info = await fromPopcat(name); }
    catch (e) { lastErr = e; try { info = await fromReddit(name); } catch (e2) { lastErr = e2; } }
    if (!info) {
      await reply('❌ *Subreddit not found:* *r/' + name + '* — ' + String((lastErr && lastErr.message) || lastErr).slice(0, 100));
      return;
    }
    await reply('🔶 *r/' + info.name + '*\n\n' +
      '📌 ' + (info.title || '—') + '\n' +
      '👥 Members: ' + (info.members != null ? Number(info.members).toLocaleString('en-IN') : '—') + '\n' +
      '🟢 Active: ' + (info.active != null ? Number(info.active).toLocaleString('en-IN') : '—') + '\n' +
      (info.nsfw ? '🔞 NSFW: haan\n' : '') +
      '📝 ' + (info.desc ? String(info.desc).slice(0, 300) : '—') + '\n' +
      '🔗 ' + info.url);
  }
};
