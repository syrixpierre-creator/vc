const { run } = require('../lib/compat');
const META = {
  file: "ai-edithair.js",
  family: "A",
  command: "edithair",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "edithair",
  aliases: ["hairstyle"],
  category: "misc",
  description: "New plugin: edithair",
  usage: ".edithair",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
