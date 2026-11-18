const { run } = require('../lib/compat');
const META = {"file":"genpass.js","family":"B","command":"gpass","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gpass2",
  aliases: [],
  category: "other",
  description: "Generate a strong password.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
