const { run } = require('../lib/compat');
const META = {"file":"random-cecanchina.js","family":"A","command":"cecanchina","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cecanchina",
  aliases: [],
  category: "random",
  description: "Legacy tool: cecanchina",
  usage: "cecanchina",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
