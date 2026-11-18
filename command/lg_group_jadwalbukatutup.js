const { run } = require('../lib/compat');
const META = {"file":"group-jadwalbukatutup.js","family":"A","command":"bukajam","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":true,"private":false}};

module.exports = {
  command: "bukajam",
  aliases: ["tutupjam","jadwal","hapusbukajam","hapustutupjam","hapusjadwal"],
  category: "group",
  description: "Legacy tool: bukajam",
  usage: "bukajam",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
