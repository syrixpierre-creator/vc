const { run } = require('../lib/compat');
const META = {
  file: "tools-upvidey.js",
  family: "A",
  command: "upvidey",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "upvidey",
  aliases: [],
  category: "misc",
  description: "New plugin: upvidey",
  usage: ".upvidey",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
