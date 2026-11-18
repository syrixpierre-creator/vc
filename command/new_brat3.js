const { run } = require('../lib/compat');
const META = {
  file: "sticker-brat3.js",
  family: "A",
  command: "brat3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "brat3",
  aliases: [],
  category: "misc",
  description: "New plugin: brat3",
  usage: ".brat3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
