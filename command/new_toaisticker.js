const { run } = require('../lib/compat');
const META = {
  file: "toai.js",
  family: "A",
  command: "toaisticker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "toaisticker",
  aliases: [],
  category: "misc",
  description: "New plugin: toaisticker",
  usage: ".toaisticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
