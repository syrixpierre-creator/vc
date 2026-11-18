const { run } = require('../lib/compat');
const META = {"file":"anime-cmds.js","family":"B","command":"garl","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "garl",
  aliases: ["imgloli","waifu","imgwaifu","neko","imgneko","megumin","imgmegumin","maid","imgmaid","awoo","imgawoo","animegirl","animegirl1","animegirl2","animegirl3","animegirl4","animegirl5","anime1","anime2","anime3","anime4","anime5"],
  category: "anime",
  description: "Download anime loli images.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
