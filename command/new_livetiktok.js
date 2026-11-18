const { run } = require('../lib/compat');
const META = {
  file: "rpg-livetiktok.js",
  family: "A",
  command: "livetiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "livetiktok",
  aliases: [],
  category: "misc",
  description: "New plugin: livetiktok",
  usage: ".livetiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
