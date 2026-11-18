const { run } = require('../lib/compat');
const META = {
  file: "amv2.js",
  family: "A",
  command: "amv2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "amv2",
  aliases: ["ampremiumv2"],
  category: "misc",
  description: "New plugin: amv2",
  usage: ".amv2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
