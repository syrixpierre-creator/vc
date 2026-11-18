QUEEN AKUMA assets (Catbox URLs — zip chhota rakhne ke liye media zip me nahi hai)

bot image  : assets/bot_image.jpg (image du bot QUEEN AKUMA)
menu video : https://files.catbox.moe/mql0wg.mp4 (tumhari QUEEN AKUMA menu video, QUEEN AKUMA ke liye
             rebrand ki gayi — 32s, 720x1280, saare "QUEEN AKUMA" text "QUEEN AKUMA" se badle)
thumbnail  : assets/bot_thumb.jpg (miniature 300px de la même image)

Use in code:
  const { resolveMedia } = require('../lib/mediaSource');
  const img = resolveMedia(require('../settings').menuImage); // Buffer or { url }

Or settings.js:
  menuImage / menuVideo (env MENU_IMAGE / MENU_VIDEO se URL override kar sakte ho)

Badalne ke liye: .customize menuimage <url> ya .setbot (owner only)
