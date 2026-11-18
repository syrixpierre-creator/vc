const { run } = require('../lib/compat');
const META = {"file":"whatsapp.js","family":"B","command":"onwa","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "onwa2",
  aliases: ["onwhatsapp","checkwa","checknumber","contacts"],
  category: "tools",
  description: "Check if a phone number is registered on WhatsApp",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
