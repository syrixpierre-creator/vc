const { run } = require('../lib/compat');
const META = {
  file: "ai-hyper.js",
  family: "A",
  command: "aihyper",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "aihyper",
  aliases: [],
  category: "misc",
  description: "New plugin: aihyper",
  usage: ".aihyper",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
