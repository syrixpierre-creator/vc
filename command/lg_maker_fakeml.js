const { run } = require('../lib/compat');
const META = {"file":"maker-fakeml.js","family":"A","command":"fakeml","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "fakeml",
  aliases: [],
  category: "maker",
  description: "Legacy tool: fakeml <teks> (reply foto)",
  usage: "fakeml <teks> (reply foto)",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
