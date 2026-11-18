const { run } = require('../lib/compat');
const META = {
  file: "internet-mangga-pop.js",
  family: "A",
  command: "mangga-pop",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "mangga-pop",
  aliases: [],
  category: "misc",
  description: "New plugin: mangga-pop",
  usage: ".mangga-pop",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
