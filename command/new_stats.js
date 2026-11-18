const { run } = require('../lib/compat');
const META = {
  file: "info-stats.js",
  family: "A",
  command: "stats",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "stats",
  aliases: [],
  category: "misc",
  description: "New plugin: stats",
  usage: ".stats",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
