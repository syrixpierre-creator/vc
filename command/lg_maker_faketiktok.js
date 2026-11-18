const { run } = require('../lib/compat');
const META = {"file":"maker-faketiktok.js","family":"A","command":"faketiktok","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "faketiktok",
  aliases: ["tiktokfake"],
  category: "maker",
  description: "Legacy tool: faketiktok",
  usage: "faketiktok",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
