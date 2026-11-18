const { run } = require('../lib/compat');
const META = {"file":"xp-profile.js","family":"A","command":"profile","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "profile",
  aliases: ["profil","me","my"],
  category: "info",
  description: "Legacy tool: profile",
  usage: "profile",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
