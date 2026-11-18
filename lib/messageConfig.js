/*****************************************************************************
 * QUEEN AKUMA — reply branding + channel forward style
 *****************************************************************************/
const settings = require('../settings');
const { resolveMedia, isUrl } = require('./mediaSource');

const channelJid = settings.channelId || '120363403408693274@newsletter';
const channelName = settings.channelName || 'INCONNU BOY SENSEI';
const thumbSrc = resolveMedia(settings.menuImage);
const thumbField = thumbSrc
  ? (Buffer.isBuffer(thumbSrc) ? { thumbnail: thumbSrc } : { thumbnailUrl: thumbSrc.url })
  : (isUrl(settings.menuImage) ? { thumbnailUrl: settings.menuImage } : {});

const channelInfo = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelJid,
      newsletterName: channelName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: 'QUEEN AKUMA🪀',
      body: 'MADE BY INCONNU BOY SENSEI',
      ...thumbField,
      mediaType: 1,
      renderLargerThumbnail: false,
      sourceUrl: settings.channelLink || 'https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J'
    }
  }
};

module.exports = { channelInfo };
