const { run } = require('../lib/compat');
const META = {
  file: "rpg-mulai.js",
  family: "A",
  command: "mulai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "mulai",
  aliases: [],
  category: "misc",
  description: "New plugin: mulai",
  usage: ".mulai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
