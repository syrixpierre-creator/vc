const { run } = require('../lib/compat');
const META = {
  file: "tqto.js",
  family: "A",
  command: "tqto",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tqto",
  aliases: ["thanks", "credits"],
  category: "misc",
  description: "New plugin: tqto",
  usage: ".tqto",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
