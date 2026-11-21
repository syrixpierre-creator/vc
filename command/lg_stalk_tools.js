'use strict';
/**
 * QUEEN AKUMA — .wastalk2 + aliases: multi-platform stalk (real APIs, no key).
 * FIX (audit batch 2): pehle ye sirf lib/compat family-B wrapper tha jiska META
 * file stalk-tools.js compat_native.json me hai hi nahi — isliye compat
 * smartEngine fallback par gir jata tha aur .twitterstalk par galat
 * "Download failed" reply aata tha. Ab seedha QUEEN-AKUMA-shape real router hai.
 * - twitterstalk / twtstalk : api.fxtwitter.com (VM se live-probed: 200)
 * - githubstalk / gstalk / gitstalk / gits : api.github.com/users (probed, .ghstalk bhi yahi use karta hai)
 * - tiktokstalk / tstalk : tikwm user info (endpoint real; VM se abhi Cloudflare 403 — host par try karega, fail ho to honest error)
 * - ytstalk / youtubestalk : YouTube Data API ko key chahiye — honest error, fake nahi
 * - chanstalk / wstalk / channelstalk : WhatsApp number stalk (./stalk-tools handler ko delegate)
 */
function invokedName(context) {
  const t = String((context && (context.rawText || context.userMessage)) || '').trim().replace(/^\./, '');
  return (t.split(/\s+/)[0] || 'wastalk2').toLowerCase();
}

async function fetchJson(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0', Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
  finally { clearTimeout(t); }
}

module.exports = {
  command: 'wastalk2',
  aliases: ['chanstalk', 'wstalk', 'channelstalk', 'tiktokstalk', 'tstalk', 'twitterstalk', 'twtstalk', 'ytstalk', 'youtubestalk', 'githubstalk', 'gstalk', 'gitstalk', 'gits'],
  category: 'stalk',
  description: 'Platform stalk: .twitterstalk / .githubstalk / .tiktokstalk <username>',
  usage: '.twitterstalk <username> | .githubstalk <username> | .tiktokstalk <username>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const invoked = invokedName(context);
    const q = (args || []).join(' ').trim();

    if (['chanstalk', 'wstalk', 'channelstalk'].includes(invoked)) {
      // WhatsApp number stalk — .wastalk handler ko delegate karo
      const wa = require('./stalk-tools');
      return wa.handler(sock, message, args, context);
    }

    if (invoked === 'wastalk2') {
      await reply('🔍 *Stalk*\n\n• `.twitterstalk <username>` — X/Twitter profile\n• `.githubstalk <username>` — GitHub profile\n• `.tiktokstalk <username>` — TikTok profile\n• `.chanstalk <number>` — WhatsApp profile');
      return;
    }

    if (['ytstalk', 'youtubestalk'].includes(invoked)) {
      await reply('❌ *YOUTUBE_API_KEY is missing.* Set it in .env.');
      return;
    }

    if (!q) {
      await reply('🔍 *Stalk*\n\nUsage: `.' + invoked + ' <username>`');
      return;
    }
    const user = q.replace(/^@/, '').split(/\s+/)[0];

    if (['twitterstalk', 'twtstalk'].includes(invoked)) {
      const d = await fetchJson('https://api.fxtwitter.com/' + encodeURIComponent(user), 12000);
      const u = d && d.user;
      if (!u) {
        await reply('❌ Twitter user `@' + user + '` not found or API is down.');
        return;
      }
      const lines = [
        '🐦 *Twitter Stalk*',
        '',
        '👤 ' + (u.name || u.screen_name) + ' (@' + u.screen_name + ')',
        (u.description ? '💬 ' + String(u.description).slice(0, 200) : null),
        '👥 Followers: ' + (u.followers ?? '—') + ' • Following: ' + (u.following ?? '—'),
        '📝 Tweets: ' + (u.tweets ?? '—') + ' • Likes: ' + (u.likes ?? '—'),
        '🔗 https://x.com/' + u.screen_name,
      ].filter((x) => x !== null);
      await reply(lines.join('\n'));
      return;
    }

    if (['githubstalk', 'gstalk', 'gitstalk', 'gits'].includes(invoked)) {
      const u = await fetchJson('https://api.github.com/users/' + encodeURIComponent(user), 12000);
      if (!u || !u.login) {
        await reply('❌ GitHub user `' + user + '` not found or API is down.');
        return;
      }
      const lines = [
        '🐙 *GitHub Stalk*',
        '',
        '👤 ' + (u.name || u.login) + ' (@' + u.login + ')',
        (u.bio ? '💬 ' + String(u.bio).slice(0, 200) : null),
        '📦 Public repos: ' + (u.public_repos ?? '—') + ' • Followers: ' + (u.followers ?? '—') + ' • Following: ' + (u.following ?? '—'),
        (u.location ? '📍 ' + u.location : null),
        '🔗 ' + (u.html_url || 'https://github.com/' + u.login),
      ].filter((x) => x !== null);
      if (u.avatar_url) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 10000);
          const res = await fetch(u.avatar_url, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.5.0' } });
          clearTimeout(t);
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.length > 1000) {
              await sock.sendMessage(chatId, { image: buf, caption: lines.join('\n') }, { quoted: message });
              return;
            }
          }
        } catch (e) { /* fall through to text */ }
      }
      await reply(lines.join('\n'));
      return;
    }

    if (['tiktokstalk', 'tstalk'].includes(invoked)) {
      const d = await fetchJson('https://www.tikwm.com/api/user/info?unique_id=@' + encodeURIComponent(user), 12000);
      const u = (d && (d.data && (d.data.user || d.data))) || null;
      if (!d || d.code !== 0 || !u || !(u.unique_id || u.nickname)) {
        await reply('❌ TikTok user `@' + user + '`: info not available right now. Try again later.');
        return;
      }
      const nick = u.nickname || u.unique_id;
      const followers = u.follower_count ?? u.followerCount ?? (u.stats && u.stats.followerCount) ?? '—';
      const following = u.following_count ?? u.followingCount ?? (u.stats && u.stats.followingCount) ?? '—';
      const videos = u.video_count ?? u.videoCount ?? (u.stats && u.stats.videoCount) ?? '—';
      const lines = [
        '🎵 *TikTok Stalk*',
        '',
        '👤 ' + nick + ' (@' + (u.unique_id || user) + ')',
        (u.signature ? '💬 ' + String(u.signature).slice(0, 200) : null),
        '👥 Followers: ' + followers + ' • Following: ' + following + ' • Videos: ' + videos,
        '🔗 https://www.tiktok.com/@' + (u.unique_id || user),
      ].filter((x) => x !== null);
      await reply(lines.join('\n'));
      return;
    }

    await reply('🔍 *Stalk*\n\nUsage: `.twitterstalk <username>` / `.githubstalk <username>` / `.tiktokstalk <username>`');
  },
};
