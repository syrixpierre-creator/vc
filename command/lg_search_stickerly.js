const { run } = require('../lib/compat');
const META = {"file":"search-stickerly.js","family":"A","command":"stickerlys","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "stickerlys",
  aliases: ["stickerlysearch"],
  category: "sticker",
  description: "Legacy tool: stickerlysearch <keyword>",
  usage: "stickerlysearch <keyword>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
