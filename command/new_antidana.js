const { run } = require('../lib/compat');
const META = {
  file: "tools-antidana.js",
  family: "A",
  command: "antidana",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antidana",
  aliases: [],
  category: "misc",
  description: "New plugin: antidana",
  usage: ".antidana",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
