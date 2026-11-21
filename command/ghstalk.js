'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .ghtrend / .ghstalk (QUEEN AKUMA port).
 * GitHub trending repos + user stalk. api.github.com, free, no key.
 * (.npmstalk QUEEN AKUMA me pehle se hai — skip kiya.)
 */
const axios = require('axios');

const GH = { timeout: 15000, headers: { 'User-Agent': 'QUEEN AKUMA', Accept: 'application/vnd.github.v3+json' } };

module.exports = {
  commands: [
    {
      command: 'ghtrend',
      aliases: ['ghtrending', 'trendingrepos'],
      description: 'GitHub trending repositories dikhao.',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const lang = (args || [])[0] ? ' language:' + (args || [])[0] : '';
        const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        try {
          const res = await axios.get('https://api.github.com/search/repositories', {
            ...GH,
            params: { q: 'created:>' + since + lang, sort: 'stars', order: 'desc', per_page: 5 }
          });
          const items = (res.data && res.data.items) || [];
          if (!items.length) { await reply('❌ Trending repos nahi mile.'); return; }
          const lines = items.map((r, i) =>
            (i + 1) + '. *' + r.full_name + '* ⭐ ' + r.stargazers_count + '\n   ' + (r.description || 'No description').slice(0, 120) + '\n   ' + r.html_url);
          await reply('🔥 *GitHub Trending (last 7 days)*' + (lang ? ' — ' + (args || [])[0] : '') + '\n\n' + lines.join('\n\n'));
        } catch (e) {
          const status = e.response && e.response.status;
          if (status === 403) await reply('❌ *GitHub rate limit reached. Try again later.*');
          else await reply('❌ Trending nahi mile: ' + String(e.message || e).slice(0, 120));
        }
      }
    },
    {
      command: 'ghstalk',
      aliases: ['ghuser', 'githubstalk'],
      description: 'GitHub user ki profile dikhao: .ghstalk <username>',
      category: 'tools',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const user = String((args || [])[0] || '').trim();
        if (!/^[\w-]{1,39}$/.test(user)) {
          await reply('❌ GitHub username do.\nExample: *.ghstalk torvalds*');
          return;
        }
        try {
          const res = await axios.get('https://api.github.com/users/' + user, GH);
          const d = res.data || {};
          await reply('🐙 *' + (d.login || user) + '*\n\n' +
            '👤 Naam: ' + (d.name || '—') + '\n' +
            '📝 Bio: ' + (d.bio || '—').slice(0, 200) + '\n' +
            '📦 Public repos: ' + (d.public_repos ?? '—') + '\n' +
            '👥 Followers: ' + (d.followers ?? '—') + '  •  Following: ' + (d.following ?? '—') + '\n' +
            '🏢 Company: ' + (d.company || '—') + '\n' +
            '📍 Location: ' + (d.location || '—') + '\n' +
            '📅 Joined: ' + (d.created_at ? d.created_at.slice(0, 10) : '—') + '\n' +
            '🔗 ' + (d.html_url || ('https://github.com/' + user)));
        } catch (e) {
          const status = e.response && e.response.status;
          if (status === 404) await reply('❌ *GitHub user not found:* *' + user + '*');
          else if (status === 403) await reply('❌ *GitHub rate limit reached. Try again later.*');
          else await reply('❌ *Profile not found:* ' + String(e.message || e).slice(0, 120));
        }
      }
    }
  ]
};
