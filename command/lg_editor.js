const { run } = require('../lib/compat');
const META = {"file":"editor.js","family":"B","command":"skull","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "skull2",
  aliases: [], // v3.4.1: effect names ab .fx ke aliases hain (sketch/pencil/.../demon) — ye wrapper sirf skull2 ke liye
  category: "editor",
  description: "Skull Photo editor.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
