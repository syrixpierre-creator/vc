const { run } = require('../lib/compat');
const META = {"file":"internet-kompas.js","family":"A","command":"kompas","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kompas",
  aliases: [],
  category: "internet",
  description: "Legacy tool: kompas",
  usage: "kompas",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
