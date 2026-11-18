const { run } = require('../lib/compat');
const META = {
  file: "tools-cekresi.js",
  family: "A",
  command: "cekresi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "cekresi",
  aliases: [],
  category: "misc",
  description: "New plugin: cekresi",
  usage: ".cekresi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
