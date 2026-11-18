const { run } = require('../lib/compat');
const META = {
  file: "story-anime.js",
  family: "A",
  command: "animestory",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "animestory",
  aliases: [],
  category: "misc",
  description: "New plugin: animestory",
  usage: ".animestory",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
