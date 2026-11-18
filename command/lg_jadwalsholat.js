const { run } = require('../lib/compat');
const META = {"file":"jadwalsholat.js","family":"A","command":"jadwalsholat","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jadwalsholat",
  aliases: ["sholat"],
  category: "internet",
  description: "Legacy tool: jadwalsholat kota",
  usage: "jadwalsholat kota",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
