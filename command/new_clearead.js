const { run } = require('../lib/compat');
const META = {
  file: "owner-clearead.js",
  family: "A",
  command: "clearead",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "clearead",
  aliases: [],
  category: "misc",
  description: "New plugin: clearead",
  usage: ".clearead",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
