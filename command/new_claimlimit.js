const { run } = require('../lib/compat');
const META = {
  file: "_claim-limit.js",
  family: "A",
  command: "claimlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "claimlimit",
  aliases: [],
  category: "misc",
  description: "New plugin: claimlimit",
  usage: ".claimlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
