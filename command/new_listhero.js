const { run } = require('../lib/compat');
const META = {
  file: "info-listheroml.js",
  family: "A",
  command: "listhero",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "listhero",
  aliases: ["heroml"],
  category: "misc",
  description: "New plugin: listhero",
  usage: ".listhero",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
