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

// Old QUEEN AKUMA style: newsletter forward tag only (no ad card).
const channelInfo = {
  contextInfo: {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelJid,
      newsletterName: channelName,
      serverMessageId: -1
    }
  }
};

module.exports = { channelInfo };
