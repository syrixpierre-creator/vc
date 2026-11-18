const { run } = require('../lib/compat');
const META = {"file":"internet-jadwalpuasa.js","family":"A","command":"jadwalpuasa","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jadwalpuasa",
  aliases: [],
  category: "internet",
  description: "Legacy tool: jadwalpuasa <kota>",
  usage: "jadwalpuasa <kota>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
