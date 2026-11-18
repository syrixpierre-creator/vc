const { run } = require('../lib/compat');
const META = {"file":"stickertake.js","family":"B","command":"claim","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "claim",
  aliases: ["takehelp","claimhelp"],
  category: "sticker",
  description: "Take sticker and add to your pack",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
