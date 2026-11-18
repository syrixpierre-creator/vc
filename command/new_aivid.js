const { run } = require('../lib/compat');
const META = {
  file: "ai-text2vid.js",
  family: "A",
  command: "aivid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "aivid",
  aliases: [],
  category: "misc",
  description: "New plugin: aivid",
  usage: ".aivid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
