const { run } = require('../lib/compat');
const META = {
  file: "fun-mimpi.js",
  family: "A",
  command: "dreamexp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dreamexp",
  aliases: [],
  category: "misc",
  description: "New plugin: dreamexp",
  usage: ".dreamexp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
