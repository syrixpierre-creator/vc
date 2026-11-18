const { run } = require('../lib/compat');
const META = {
  file: "cmd-lock.js",
  family: "A",
  command: "un",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "un",
  aliases: [],
  category: "misc",
  description: "New plugin: un",
  usage: ".un",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
