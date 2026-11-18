const { run } = require('../lib/compat');
const META = {"file":"setbirthday.js","family":"A","command":"setbirthday","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "setbirthday",
  aliases: [],
  category: "info",
  description: "Legacy tool: setbirthday",
  usage: "setbirthday",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
