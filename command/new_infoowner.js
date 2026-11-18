const { run } = require('../lib/compat');
const META = {
  file: "main-creator.js",
  family: "A",
  command: "infoowner",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "infoowner",
  aliases: [],
  category: "misc",
  description: "New plugin: infoowner",
  usage: ".infoowner",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
