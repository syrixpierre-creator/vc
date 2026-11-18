const { run } = require('../lib/compat');
const META = {
  file: "ai-wuguri.js",
  family: "A",
  command: "wuguri",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wuguri",
  aliases: [],
  category: "misc",
  description: "New plugin: wuguri",
  usage: ".wuguri",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
