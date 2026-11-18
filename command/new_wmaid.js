const { run } = require('../lib/compat');
const META = {
  file: "nsfw-wmaid.js",
  family: "A",
  command: "wmaid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "wmaid",
  aliases: [],
  category: "misc",
  description: "New plugin: wmaid",
  usage: ".wmaid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
