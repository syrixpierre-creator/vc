const { run } = require('../lib/compat');
const META = {
  file: "nsfwstiker.js",
  family: "A",
  command: "nsfwstiker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nsfwstiker",
  aliases: [],
  category: "misc",
  description: "New plugin: nsfwstiker",
  usage: ".nsfwstiker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
