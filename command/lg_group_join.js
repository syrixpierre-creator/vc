const { run } = require('../lib/compat');
const META = {"file":"group-join.js","family":"B","command":"joinme","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "joinme",
  aliases: ["f_join"],
  category: "group",
  description: "Join a group from invite link",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
