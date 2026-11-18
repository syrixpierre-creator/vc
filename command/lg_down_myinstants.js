const { run } = require('../lib/compat');
const META = {"file":"down-myinstants.js","family":"A","command":"myinstants","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "myinstants",
  aliases: ["sound","instants"],
  category: "downloader",
  description: "Legacy tool: myinstants search <query>",
  usage: "myinstants search <query>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
