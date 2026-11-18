/*****************************************************************************
 * QUEEN AKUMA — Bot assets (Catbox URLs, keeps zip small)
 * Bot photo  : assets/bot_image.jpg  (anime QUEEN AKUMA logo)
 * Menu video : désactivé — image uniquement
 * Thumbnail  : same as bot photo
 * Env se override kar sakte ho: MENU_IMAGE / MENU_VIDEO / THUMB_URL
 *****************************************************************************/
module.exports = {
  botImage: process.env.MENU_IMAGE || require('path').join(__dirname, 'bot_image.jpg'),
  menuVideo: '',
  // alias names used by some plugins
  bot_image: process.env.MENU_IMAGE || require('path').join(__dirname, 'bot_image.jpg'),
  menu_video: '',
  thumbnail: process.env.THUMB_URL || require('path').join(__dirname, 'bot_thumb.jpg'),
};
