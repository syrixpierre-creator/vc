const { run } = require('../lib/compat');
const META = {
  file: "tools-otpboom.js",
  family: "A",
  command: "otpbomb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "otpbomb",
  aliases: [],
  category: "misc",
  description: "New plugin: otpbomb",
  usage: ".otpbomb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
