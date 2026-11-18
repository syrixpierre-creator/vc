const { run } = require('../lib/compat');
const META = {
  file: "checkerror.js",
  family: "A",
  command: "checkerror",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "checkerror",
  aliases: [],
  category: "misc",
  description: "New plugin: checkerror",
  usage: ".checkerror",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
