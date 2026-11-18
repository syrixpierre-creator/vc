const { run } = require('../lib/compat');
const META = {
  file: "owner-aireset.js",
  family: "A",
  command: "resetchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "resetchat",
  aliases: [],
  category: "misc",
  description: "New plugin: resetchat",
  usage: ".resetchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
