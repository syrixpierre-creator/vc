const { run } = require('../lib/compat');
const META = {
  file: "tool-uppastebin.js",
  family: "A",
  command: "up-pb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "up-pb",
  aliases: [],
  category: "misc",
  description: "New plugin: up-pb",
  usage: ".up-pb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
