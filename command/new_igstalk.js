const { run } = require('../lib/compat');
const META = {
  file: "stalk-ig.js",
  family: "A",
  command: "igstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "igstalk",
  aliases: [],
  category: "misc",
  description: "New plugin: igstalk",
  usage: ".igstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
