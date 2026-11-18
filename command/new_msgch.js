const { run } = require('../lib/compat');
const META = {
  file: "msgch.js",
  family: "A",
  command: "msgch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "msgch",
  aliases: [],
  category: "misc",
  description: "New plugin: msgch",
  usage: ".msgch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
