const { run } = require('../lib/compat');
const META = {"file":"tools-imageedit.js","family":"B","command":"wantedposter","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "wantedposter",
  aliases: ["nokia","nokiaframe","imgjoke","jokeoverhead","jail","jailbars","invertcolors","greyscale","imageblur","ad","adframe","advertisement"],
  category: "image",
  description: "Create wanted poster effect",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
