const { run } = require('../lib/compat');
const META = {
  file: "tools-antilinkphising.js",
  family: "A",
  command: "antiphising",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antiphising",
  aliases: [],
  category: "misc",
  description: "New plugin: antiphising",
  usage: ".antiphising",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
