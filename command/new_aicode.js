const { run } = require('../lib/compat');
const META = {
  file: "ai-code.js",
  family: "A",
  command: "aicode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "aicode",
  aliases: [],
  category: "misc",
  description: "New plugin: aicode",
  usage: ".aicode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
