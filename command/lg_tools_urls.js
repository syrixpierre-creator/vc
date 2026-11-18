const { run } = require('../lib/compat');
const META = {"file":"tools-urls.js","family":"B","command":"abellashort","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "abellashort2",
  aliases: ["shortabella","abellaurl","urlshort"],
  category: "tools",
  description: "Shorten URLs using Abella shortener service",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
