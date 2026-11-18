const { run } = require('../lib/compat');
const META = {
  file: "main-sosmed.js",
  family: "A",
  command: "sosmed",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sosmed",
  aliases: [],
  category: "misc",
  description: "New plugin: sosmed",
  usage: ".sosmed",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
