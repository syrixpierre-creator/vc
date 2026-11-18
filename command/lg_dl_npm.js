const { run } = require('../lib/compat');
const META = {"file":"dl-npm.js","family":"B","command":"npm","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "npm2",
  aliases: ["npmpkg","package","npminfo","pkginfo","packageinfo"],
  category: "downloader",
  description: "Search for a package on npm.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
