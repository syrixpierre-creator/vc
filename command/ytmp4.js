const apiReg = require('../lib/apiRegistry');
const { downloadAny, youtubeAudio, youtubeVideo, pickUrl, songCaption } = require('../lib/downloadApis');

module.exports = {
  command: 'ytmp4',
  aliases: ['ytvideo', 'ytmp4dl'],
  category: 'download',
  description: 'YouTube MP4 — Arslan first, auto failover',
  usage: '.ytmp4 <youtube url>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(' ').trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      return sock.sendMessage(chatId, { text: 'Usage: `.ytmp4 https://youtu.be/...`' }, { quoted: message });
    }
    await sock.sendMessage(chatId, { text: '⏳ YT MP4…' }, { quoted: message }).catch(() => {});

    // v2.8.9: video sources (order) — registry -> downloadAny -> Elite ytmp4.
    // Har source se video + metadata (views/channel/duration) ke saath rich card.
    let media = null;
    let meta = { title: 'YouTube' };
    // 1) registry fast failover
    const r = await apiReg.fetchNamedFast('ytmp4', { url }, { slowMs: 8000, timeoutMs: 25000 });
    if (r.ok) {
      const d = r.data;
      media = pickUrl(d, ['url', 'download', 'video', 'mp4', 'link', 'result', 'data']);
      if (d.title || d.data?.title) meta.title = d.title || d.data.title;
      meta.thumbnail = d.thumbnail || d.data?.thumbnail || '';
    }
    // 2) downloadAny chain
    if (!media) {
      const any = await downloadAny(url);
      if (any?.mediaUrl) {
        media = any.mediaUrl;
        if (any.title) meta.title = any.title;
        if (any.thumbnail) meta.thumbnail = any.thumbnail;
      }
    }
    // 3) Elite ytmp4 (verified live) — video + full metadata (views/channel/duration)
    // 12s timeout race: conversion slow ho to command hang nahi karega.
    if (!media) {
      try {
        const v = await Promise.race([
          youtubeVideo(url),
          new Promise((res) => setTimeout(() => res(null), 12000))
        ]);
        if (v && v.download) {
          media = v.download;
          if (v.title && v.title !== 'YouTube') meta.title = v.title;
          if (v.views != null) meta.views = v.views;
          if (v.channel) meta.channel = v.channel;
          if (v.author) meta.author = v.author;
          if (v.duration) meta.duration = v.duration;
          if (v.uploaded) meta.uploaded = v.uploaded;
          if (v.thumbnail) meta.thumbnail = v.thumbnail;
        }
      } catch (_) {}
    }
    // 4) metadata enrich (best-effort, 12s race) — video registry/downloadAny se
    // mila ho to uska views/channel bhi card me aaye.
    if (media && (meta.views == null || !meta.channel)) {
      try {
        const v = await Promise.race([
          youtubeVideo(url),
          new Promise((res) => setTimeout(() => res(null), 12000))
        ]);
        if (v) {
          if (v.title && v.title !== 'YouTube') meta.title = v.title;
          if (v.views != null) meta.views = v.views;
          if (v.channel) meta.channel = v.channel;
          if (v.author) meta.author = v.author;
          if (v.duration) meta.duration = v.duration;
          if (v.uploaded) meta.uploaded = v.uploaded;
          if (v.thumbnail) meta.thumbnail = v.thumbnail;
        }
      } catch (_) {}
    }
    if (!media) {
      return sock.sendMessage(chatId, { text: '❌ Video nahi mila (saari APIs fail/slow).' }, { quoted: message });
    }
    try {
      await sock.sendMessage(chatId, {
        video: { url: media },
        mimetype: 'video/mp4',
        caption: songCaption({ ...meta, title: meta.title || 'YouTube', source: 'YouTube' })
      }, { quoted: message });
    } catch (e) {
      await sock.sendMessage(chatId, { text: `✅ Link:\n${media}\n\n_${e.message}_` }, { quoted: message });
    }
  }
};
