const { run } = require('../lib/compat');
const META = {"file":"tool-tempmail.js","family":"B","command":"tempmail","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tempmail",
  aliases: ["genmail","checkmail","inbox","tmail","mailinbox"],
  category: "tools",
  description: "Generate a new temporary email address",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
