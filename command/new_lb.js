const { run } = require('../lib/compat');
const META = {
  file: "rpg-leaderboard.js",
  family: "A",
  command: "lb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "lb",
  aliases: [],
  category: "misc",
  description: "New plugin: lb",
  usage: ".lb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
