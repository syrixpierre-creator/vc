const { run } = require('../lib/compat');
const META = {
  file: "ai-dopple.js",
  family: "A",
  command: "dopple",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dopple",
  aliases: [],
  category: "misc",
  description: "New plugin: dopple",
  usage: ".dopple",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
