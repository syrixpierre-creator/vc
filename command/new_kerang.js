const { run } = require('../lib/compat');
const META = {
  file: "fun-kerangajaib.js",
  family: "A",
  command: "kerang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "kerang",
  aliases: ["kerangajaib"],
  category: "misc",
  description: "New plugin: kerang",
  usage: ".kerang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
