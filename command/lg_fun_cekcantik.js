const { run } = require('../lib/compat');
const META = {"file":"fun-cekcantik.js","family":"A","command":"cantikcek","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cantikcek",
  aliases: ["cekcantik"],
  category: "fun",
  description: "Legacy tool: cantikcek",
  usage: "cantikcek",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
