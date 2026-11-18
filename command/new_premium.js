const { run } = require('../lib/compat');
const META = {
  file: "sticker.js",
  family: "B",
  command: "premium",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "premium",
  aliases: [],
  category: "misc",
  description: "New plugin: premium",
  usage: ".premium",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
