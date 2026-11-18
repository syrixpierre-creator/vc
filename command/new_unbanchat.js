const { run } = require('../lib/compat');
const META = {
  file: "owner-unbanchat.js",
  family: "A",
  command: "unbanchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "unbanchat",
  aliases: [],
  category: "misc",
  description: "New plugin: unbanchat",
  usage: ".unbanchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
