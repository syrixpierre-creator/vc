const { run } = require('../lib/compat');
const META = {
  file: "tools-upch.js",
  family: "A",
  command: "upch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "upch",
  aliases: ["setchid", "addchid", "getchid"],
  category: "misc",
  description: "New plugin: upch",
  usage: ".upch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
