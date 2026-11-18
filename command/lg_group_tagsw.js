const { run } = require('../lib/compat');
const META = {"file":"group-tagsw.js","family":"A","command":"tagsw","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":false,"private":false}};

module.exports = {
  command: "tagsw",
  aliases: [],
  category: "group",
  description: "Legacy tool: tagsw <group_id> <teks>",
  usage: "tagsw <group_id> <teks>",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
