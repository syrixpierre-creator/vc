const { run } = require('../lib/compat');
const META = {"file":"group-demote.js","family":"B","command":"dismiss","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "dismiss",
  aliases: [],
  category: "group",
  description: "Demote a group admin to normal member",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
