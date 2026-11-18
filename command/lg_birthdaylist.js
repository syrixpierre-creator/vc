const { run } = require('../lib/compat');
const META = {"file":"birthdaylist.js","family":"A","command":"listbirthday","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "listbirthday",
  aliases: [],
  category: "info",
  description: "Legacy tool: listbirthday",
  usage: "listbirthday",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
