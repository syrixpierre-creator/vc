const { run } = require('../lib/compat');
const META = {
  file: "ppjsewa.js",
  family: "A",
  command: "perpanjangsewa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "perpanjangsewa",
  aliases: ["extendsewa"],
  category: "misc",
  description: "New plugin: perpanjangsewa",
  usage: ".perpanjangsewa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
