const { run } = require('../lib/compat');
const META = {
  file: "anime-ongoing.js",
  family: "A",
  command: "ongoing",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ongoing",
  aliases: [],
  category: "misc",
  description: "New plugin: ongoing",
  usage: ".ongoing",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
