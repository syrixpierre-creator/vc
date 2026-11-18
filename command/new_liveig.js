const { run } = require('../lib/compat');
const META = {
  file: "rpg-liveig.js",
  family: "A",
  command: "liveig",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "liveig",
  aliases: [],
  category: "misc",
  description: "New plugin: liveig",
  usage: ".liveig",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
