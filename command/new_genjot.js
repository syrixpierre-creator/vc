const { run } = require('../lib/compat');
const META = {
  file: "fun-stress.js",
  family: "A",
  command: "genjot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "genjot",
  aliases: ["nenen", "wangy", "curhat", "perkosa"],
  category: "misc",
  description: "New plugin: genjot",
  usage: ".genjot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
