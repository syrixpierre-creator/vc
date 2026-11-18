const { run } = require('../lib/compat');
const META = {
  file: "tt2.js",
  family: "A",
  command: "tt2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tt2",
  aliases: [],
  category: "misc",
  description: "New plugin: tt2",
  usage: ".tt2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
