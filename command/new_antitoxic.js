const { run } = require('../lib/compat');
const META = {
  file: "group-antitoxic.js",
  family: "A",
  command: "antitoxic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antitoxic",
  aliases: [],
  category: "misc",
  description: "New plugin: antitoxic",
  usage: ".antitoxic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
