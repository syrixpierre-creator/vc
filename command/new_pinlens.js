const { run } = require('../lib/compat');
const META = {
  file: "pinlens.js",
  family: "A",
  command: "pinlens",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "pinlens",
  aliases: [],
  category: "misc",
  description: "New plugin: pinlens",
  usage: ".pinlens",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
