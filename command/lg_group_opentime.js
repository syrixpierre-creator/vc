const { run } = require('../lib/compat');
const META = {"file":"group-opentime.js","family":"A","command":"opentime","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":true,"private":false}};

module.exports = {
  command: "opentime",
  aliases: [],
  category: "group",
  description: "Legacy tool: opentime <angka> <unit>",
  usage: "opentime <angka> <unit>",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
