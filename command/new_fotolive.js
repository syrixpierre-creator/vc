const { run } = require('../lib/compat');
const META = {
  file: "tools-fotolive.js",
  family: "A",
  command: "fotolive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fotolive",
  aliases: [],
  category: "misc",
  description: "New plugin: fotolive",
  usage: ".fotolive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
