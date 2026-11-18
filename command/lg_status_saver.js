const { run } = require('../lib/compat');
const META = {"file":"status-saver.js","family":"B","command":"save","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "save2",
  aliases: ["savestatus","statusave","downloadstatus"],
  category: "tools",
  description: "Save status media (images/videos)",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
