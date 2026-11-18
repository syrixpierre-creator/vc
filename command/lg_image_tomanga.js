const { run } = require('../lib/compat');
const META = {"file":"image-tomanga.js","family":"A","command":"tomanga","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tomanga",
  aliases: ["manga"],
  category: "image",
  description: "Legacy tool: tomanga",
  usage: "tomanga",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
