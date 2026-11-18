const { run } = require('../lib/compat');
const META = {"file":"dl getpp.js","family":"B","command":"getprofile","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "getprofile",
  aliases: ["pp","dp"],
  category: "downloader",
  description: "Get profile picture of any number",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
