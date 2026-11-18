const { run } = require('../lib/compat');
const META = {"file":"sertifikat-darksistem.js","family":"A","command":"srtdarksistem","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "srtdarksistem",
  aliases: [],
  category: "maker",
  description: "Legacy tool: srtdarksistem <teks>",
  usage: "srtdarksistem <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
