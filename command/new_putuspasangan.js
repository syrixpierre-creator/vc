const { run } = require('../lib/compat');
const META = {
  file: "putuspasangan.js",
  family: "A",
  command: "putuspasangan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "putuspasangan",
  aliases: [],
  category: "misc",
  description: "New plugin: putuspasangan",
  usage: ".putuspasangan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
