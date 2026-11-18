const { run } = require('../lib/compat');
const META = {"file":"online.js","family":"B","command":"online","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "online",
  aliases: ["whosonline","onlinemembers"],
  category: "main",
  description: "Check who's online in the group (Admins & Owner only)",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
