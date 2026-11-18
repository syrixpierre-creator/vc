const { run } = require('../lib/compat');
const META = {
  file: "group-upswgc.js",
  family: "A",
  command: "swgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "swgc",
  aliases: [],
  category: "misc",
  description: "New plugin: swgc",
  usage: ".swgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
