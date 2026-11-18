const { run } = require('../lib/compat');
const META = {"file":"group-promote.js","family":"B","command":"makeadmin","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "makeadmin",
  aliases: [],
  category: "group",
  description: "Promote a member to group admin",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
