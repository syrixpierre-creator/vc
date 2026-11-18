const { run } = require('../lib/compat');
const META = {
  file: "ai-nijika.js",
  family: "A",
  command: "nijikaai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "nijikaai",
  aliases: [],
  category: "misc",
  description: "New plugin: nijikaai",
  usage: ".nijikaai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
