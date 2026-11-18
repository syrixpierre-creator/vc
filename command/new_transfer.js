const { run } = require('../lib/compat');
const META = {
  file: "rpg-mentransfer.js",
  family: "A",
  command: "transfer",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "transfer",
  aliases: [],
  category: "misc",
  description: "New plugin: transfer",
  usage: ".transfer",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
