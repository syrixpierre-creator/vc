const { run } = require('../lib/compat');
const META = {
  file: "rpg-reward.js",
  family: "A",
  command: "harian",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "harian",
  aliases: ["mingguan", "bulanan"],
  category: "misc",
  description: "New plugin: harian",
  usage: ".harian",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
