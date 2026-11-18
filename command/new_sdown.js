const { run } = require('../lib/compat');
const META = {
  file: "down-spdl.js",
  family: "A",
  command: "sdown",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sdown",
  aliases: [],
  category: "misc",
  description: "New plugin: sdown",
  usage: ".sdown",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
