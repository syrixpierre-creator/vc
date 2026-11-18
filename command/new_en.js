const { run } = require('../lib/compat');
const META = {
  file: "enable.js",
  family: "A",
  command: "en",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "en",
  aliases: ["dis"],
  category: "misc",
  description: "New plugin: en",
  usage: ".en",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
