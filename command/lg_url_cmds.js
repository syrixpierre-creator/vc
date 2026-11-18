const { run } = require('../lib/compat');
const META = {"file":"url-cmds.js","family":"B","command":"quax","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "quax",
  aliases: ["qu","url2","telegraph","tg","url3","uguu","ug","url4","puticu","put","url5","iimg","url6","catbox","cb","url7","ayanami","aya","url8","envs","es"],
  category: "converter",
  description: "Upload media to Qu.ax (Permanent & Highly Reliable)",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
