const { run } = require('../lib/compat');
const META = {
  file: "totalpesan.js",
  family: "A",
  command: "totalchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "totalchat",
  aliases: [],
  category: "misc",
  description: "New plugin: totalchat",
  usage: ".totalchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
