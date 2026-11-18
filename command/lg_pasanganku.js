const { run } = require('../lib/compat');
const META = {"file":"pasanganku.js","family":"A","command":"pasanganku","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pasanganku",
  aliases: ["pacarku"],
  category: "fun",
  description: "Legacy tool: pasanganku",
  usage: "pasanganku",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
