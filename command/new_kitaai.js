const { run } = require('../lib/compat');
const META = {
  file: "ai-kita.js",
  family: "A",
  command: "kitaai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "kitaai",
  aliases: [],
  category: "misc",
  description: "New plugin: kitaai",
  usage: ".kitaai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
