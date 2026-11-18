const { run } = require('../lib/compat');
const META = {"file":"tools-ocr.js","family":"A","command":"ocr","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ocr",
  aliases: [],
  category: "tools",
  description: "Legacy tool: ocr",
  usage: "ocr",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
