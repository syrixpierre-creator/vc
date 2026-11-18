const { run } = require('../lib/compat');
const META = {
  file: "ai-bocchi.js",
  family: "A",
  command: "bocchiai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "bocchiai",
  aliases: [],
  category: "misc",
  description: "New plugin: bocchiai",
  usage: ".bocchiai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
