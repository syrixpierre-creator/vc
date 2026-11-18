const { run } = require('../lib/compat');
const META = {"file":"get-jid.js","family":"B","command":"jid","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jid",
  aliases: ["gjid"],
  category: "tools",
  description: "Return Group JID (Everyone) or User JID in private chat",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
