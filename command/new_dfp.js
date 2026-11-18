const { run } = require('../lib/compat');
const META = {
  file: "owner-dfp.js",
  family: "A",
  command: "dfp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dfp",
  aliases: [],
  category: "misc",
  description: "New plugin: dfp",
  usage: ".dfp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
