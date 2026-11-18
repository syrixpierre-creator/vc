const { run } = require('../lib/compat');
const META = {"file":"Channelreact.js","family":"B","command":"chreact","perms":{"owner":true,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "chreact",
  aliases: ["channelreact"],
  category: "owner",
  description: "React to a WhatsApp Channel post by URL or newsletter JID",
  usage: "",
  ownerOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
