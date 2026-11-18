const { run } = require('../lib/compat');
const META = {
  file: "group-totalpesan.js",
  family: "A",
  command: "totalpesan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "totalpesan",
  aliases: [],
  category: "misc",
  description: "New plugin: totalpesan",
  usage: ".totalpesan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
