const { run } = require('../lib/compat');
const META = {
  file: "tool-chord.js",
  family: "A",
  command: "chord",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "chord",
  aliases: [],
  category: "misc",
  description: "New plugin: chord",
  usage: ".chord",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
