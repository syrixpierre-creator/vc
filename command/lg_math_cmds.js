const { run } = require('../lib/compat');
const META = {"file":"math-cmds.js","family":"B","command":"sqrt","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sqrt",
  aliases: ["power","percent","table","factorial","random","average","max","min"],
  category: "math",
  description: "Square root",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
