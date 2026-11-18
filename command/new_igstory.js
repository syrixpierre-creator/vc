const { run } = require('../lib/compat');
const META = {
  file: "maker-fakestory.js",
  family: "A",
  command: "igstory",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "igstory",
  aliases: [],
  category: "misc",
  description: "New plugin: igstory",
  usage: ".igstory",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
