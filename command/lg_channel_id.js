const { run } = require('../lib/compat');
const META = {"file":"channel-id.js","family":"B","command":"newsletter","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "newsletter3",
  aliases: ["cjid","id","channelinfo","chaninfo"],
  category: "whatsapp",
  description: "Get WhatsApp Channel info from link",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
