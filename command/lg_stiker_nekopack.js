const { run } = require('../lib/compat');
const META = {"file":"stiker-nekopack.js","family":"A","command":"smug","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "smug",
  aliases: ["woof","gasm","goose","cuddle","avatar","slap","v3","pat","gecg","feed","fox_girl","lizard","hug","tickle","spank","lewd","ngif"],
  category: "sticker",
  description: "Legacy tool: smug",
  usage: "smug",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
