const { run } = require('../lib/compat');
const META = {"file":"internet-github-trend.js","family":"A","command":"githubtrend","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "githubtrend",
  aliases: [],
  category: "internet",
  description: "Legacy tool: githubtrend",
  usage: "githubtrend",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
