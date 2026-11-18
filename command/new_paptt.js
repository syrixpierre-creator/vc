const { run } = require('../lib/compat');
const META = {
  file: "nsfw-paptt.js",
  family: "A",
  command: "paptt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "paptt",
  aliases: [],
  category: "misc",
  description: "New plugin: paptt",
  usage: ".paptt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
