const { run } = require('../lib/compat');
const META = {"file":"maker-berita.js","family":"A","command":"berita","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "berita",
  aliases: ["beritamaker"],
  category: "maker",
  description: "Legacy tool: berita",
  usage: "berita",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
