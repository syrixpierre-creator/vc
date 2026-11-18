const { run } = require('../lib/compat');
const META = {"file":"jadian-nembak.js","family":"A","command":"tembak","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tembak",
  aliases: ["jadian"],
  category: "fun",
  description: "Legacy tool: tembak @tag",
  usage: "tembak @tag",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
