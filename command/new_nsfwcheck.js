const { run } = require('../lib/compat');
const META = {
  file: "ai-nsfwcheck.js",
  family: "A",
  command: "nsfwcheck",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nsfwcheck",
  aliases: [],
  category: "misc",
  description: "New plugin: nsfwcheck",
  usage: ".nsfwcheck",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
