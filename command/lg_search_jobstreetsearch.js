const { run } = require('../lib/compat');
const META = {"file":"search-jobstreetsearch.js","family":"A","command":"jobstreetsearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jobstreetsearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: jobstreetsearch <posisi>|<kota>",
  usage: "jobstreetsearch <posisi>|<kota>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
