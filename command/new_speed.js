const { run } = require('../lib/compat');
const META = {
  file: "speed.js",
  family: "A",
  command: "speed",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "speed",
  aliases: ["info"],
  category: "misc",
  description: "New plugin: speed",
  usage: ".speed",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
