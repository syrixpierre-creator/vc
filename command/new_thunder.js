const { run } = require('../lib/compat');
const META = {
  file: "textmaker.js",
  family: "B",
  command: "thunder",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "thunder",
  aliases: [],
  category: "misc",
  description: "New plugin: thunder",
  usage: ".thunder",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
