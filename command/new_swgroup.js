const { run } = require('../lib/compat');
const META = {
  file: "owner-swgc.js",
  family: "A",
  command: "swgroup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "swgroup",
  aliases: [],
  category: "misc",
  description: "New plugin: swgroup",
  usage: ".swgroup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
