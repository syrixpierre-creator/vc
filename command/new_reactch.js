const { run } = require('../lib/compat');
const META = {
  file: "reactch.js",
  family: "A",
  command: "reactch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "reactch",
  aliases: [],
  category: "misc",
  description: "New plugin: reactch",
  usage: ".reactch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
