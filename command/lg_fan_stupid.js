const { run } = require('../lib/compat');
const META = {"file":"fan-stupid.js","family":"B","command":"im-stupid","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "im-stupid2",
  aliases: ["dog"],
  category: "fun",
  description: "Generate 'its so stupid' meme with custom text",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
