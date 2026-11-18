const { run } = require('../lib/compat');
const META = {
  file: "ai-elaina.js",
  family: "A",
  command: "elainaai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "elainaai",
  aliases: [],
  category: "misc",
  description: "New plugin: elainaai",
  usage: ".elainaai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
