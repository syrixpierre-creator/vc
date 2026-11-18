const { run } = require('../lib/compat');
const META = {
  file: "tools-logopronhub.js",
  family: "A",
  command: "pornhublogo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "pornhublogo",
  aliases: [],
  category: "misc",
  description: "New plugin: pornhublogo",
  usage: ".pornhublogo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
