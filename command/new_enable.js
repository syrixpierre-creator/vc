const { run } = require('../lib/compat');
const META = {
  file: "main-enable.js",
  family: "A",
  command: "enable",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "enable",
  aliases: ["disable"],
  category: "misc",
  description: "New plugin: enable",
  usage: ".enable",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
