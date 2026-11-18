const { run } = require('../lib/compat');
const META = {
  file: "rpg-liveyt.js",
  family: "A",
  command: "liveyt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "liveyt",
  aliases: [],
  category: "misc",
  description: "New plugin: liveyt",
  usage: ".liveyt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
