const { run } = require('../lib/compat');
const META = {
  file: "tes-pin2.js",
  family: "A",
  command: "pinterest2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "pinterest2",
  aliases: ["pin2"],
  category: "misc",
  description: "New plugin: pinterest2",
  usage: ".pinterest2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
