const { run } = require('../lib/compat');
const META = {
  file: "tools-getpp.js",
  family: "A",
  command: "ppwa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ppwa",
  aliases: [],
  category: "misc",
  description: "New plugin: ppwa",
  usage: ".ppwa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
