const { run } = require('../lib/compat');
const META = {"file":"spamtag.js","family":"A","command":"spamtag","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":false,"private":false}};

module.exports = {
  command: "spamtag",
  aliases: [],
  category: "group",
  description: "Legacy tool: spamtag @user",
  usage: "spamtag @user",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
