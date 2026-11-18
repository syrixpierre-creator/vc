const { run } = require('../lib/compat');
const META = {
  file: "antiBot.js",
  family: "B",
  command: 'antibotalt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antibot",
  aliases: ["antibotwarn"],
  category: "misc",
  description: "New plugin: antibot",
  usage: ".antibot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
