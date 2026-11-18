const { run } = require('../lib/compat');
const META = {"file":"cpanel.js","family":"A","command":"pannel","perms":{"owner":true,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pannel",
  aliases: ["1gb","2gb","3gb","4gb","5gb","6gb","7gb","8gb","9gb","10gb","unli","unlimited","createadmin","listpanel","listadmin","delpanel","deladmin"],
  category: "panel",
  description: "Legacy tool: pannel",
  usage: "pannel",
  ownerOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
