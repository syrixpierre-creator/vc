const { run } = require('../lib/compat');
const META = {"file":"maker-hitamkan.js","family":"A","command":"tobotak","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tobotak",
  aliases: ["tochibi","tofunk","tofigura","tofigurav2","tofigurav3","toghibli","tohijab","tojapanese","tojepang","tokacamata","tokamboja","tolego","toliquor","tomaid","tomirror","tomoai","tomonyet","topacar","topeci","topiramida","toputih","toreal","toroblox","toroh","totato","totua","toviking","tozombie","tounderground","tohitam"],
  category: "maker",
  description: "Legacy tool: tobotak",
  usage: "tobotak",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
