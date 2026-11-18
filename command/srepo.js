'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .srepo (CHAMA port).
 * Kisi bhi GitHub repo ki info nikalo. api.github.com, free, no key.
 */
const axios = require('axios');

module.exports = {
  command: 'srepo',
  aliases: ['ghrepo', 'repoinfo'],
  description: 'GitHub repo ki info dikhao: .srepo owner/repo',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const repo = String((args || [])[0] || '').trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      await reply('❌ Repo is format me do: *.srepo owner/repo*\nExample: .srepo INCONNU-BOY-SENSEI/QUEEN-AKUMA');
      return;
    }
    try {
      const res = await axios.get('https://api.github.com/repos/' + repo, {
        timeout: 15000,
        headers: { 'User-Agent': 'QUEEN AKUMA', Accept: 'application/vnd.github.v3+json' }
      });
      const d = res.data || {};
      const fmtDate = (s) => (s ? s.slice(0, 10) : '—');
      await reply('📦 *' + (d.full_name || repo) + '*\n\n' +
        '📝 ' + (d.description || 'No description') + '\n' +
        '⭐ Stars: ' + (d.stargazers_count ?? '—') + '  •  🍴 Forks: ' + (d.forks_count ?? '—') + '\n' +
        '👀 Watchers: ' + (d.subscribers_count ?? '—') + '  •  ❗ Open issues: ' + (d.open_issues_count ?? '—') + '\n' +
        '💻 Language: ' + (d.language || '—') + '\n' +
        '📄 License: ' + ((d.license && d.license.spdx_id) || '—') + '\n' +
        '📅 Created: ' + fmtDate(d.created_at) + '  •  🔄 Updated: ' + fmtDate(d.updated_at) + '\n' +
        '💾 Size: ' + (d.size ? (d.size / 1024).toFixed(1) + ' MB' : '—') + '\n' +
        '🔗 ' + (d.html_url || ('https://github.com/' + repo)));
    } catch (e) {
      const status = e.response && e.response.status;
      if (status === 404) await reply('❌ Repo nahi mila: *' + repo + '* (private ya galat naam ho sakta hai)');
      else if (status === 403) await reply('❌ GitHub rate limit lag gayi (bina key ke 60 req/hour). Thodi der baad try karo.');
      else await reply('❌ Repo info nahi mili: ' + String(e.message || e).slice(0, 120));
    }
  }
};
