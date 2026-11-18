const { run } = require('../lib/compat');
const META = {
  file: "rpg-guild.js",
  family: "A",
  command: "guild",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "guild",
  aliases: [],
  category: "misc",
  description: "New plugin: guild",
  usage: ".guild",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
