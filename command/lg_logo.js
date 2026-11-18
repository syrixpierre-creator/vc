const { run } = require('../lib/compat');
const META = {"file":"logo.js","family":"B","command":"glossysilver","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "glossysilver2",
  aliases: ["glossy","silverlogo","angelwing","queen-akuma6","facebooktypo","queen-akuma5","hollywoodstar","queen-akuma4","blueneonlogo","blueneon","fireworks","queen-akuma3","fpsgaminglogo","queen-akuma2","assassinlogo","queen-akuma1","footballlogo","ball","neondevilwings","neon","mascotshield","mascot","writetext","textwrite","baby","writtentext","blackpinklogo","bplogo","pinkblack","glitchtext","glitch","textglitch","advancedglow","advglow","glowadvanced","typographytext","typography","typo","pixelglitch","pixelg","glitchpixel","neonglitch","neong","glitchneon","nigerianflag","ngflag","nigeria","americanflag","usflag","usaflag","america","deletingtext","deltext","textdelete","blackpinkstyle","bpstyle","pinkblackstyle","glowingtext","glowtxt","textglow","underwater","underw","waterlogo","logomaker","makelogo","logomake","cartoonstyle","toonlogo","papercut","cutpaper","papercutlogo","effectclouds","cloudeffect","clouds","gradienttext","gradient","textgradient","summerbeach","beachsummer","beach","sandsummer","summersand","sand","sandlogo","luxurygold","goldluxury","luxgold","galaxy","galaxylogo","space","logo1917","1917","1917logo","makingneon","neonmake","neonlogo","texteffect","effecttext","fxtext","galaxystyle","stylegalaxy","galstyle","lighteffect","effectlight","lightlogo","logolist","logos","logo","logohelp","logomenu"],
  category: "logo",
  description: "Create Glossy Silver logo",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
