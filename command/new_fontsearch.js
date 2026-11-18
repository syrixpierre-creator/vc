const { run } = require('../lib/compat');
const META = {
  file: "fontsearch.js",
  family: "A",
  command: "fontsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fontsearch",
  aliases: [],
  category: "misc",
  description: "New plugin: fontsearch",
  usage: ".fontsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
