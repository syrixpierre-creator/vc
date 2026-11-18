const { run } = require('../lib/compat');
const META = {
  file: "info-dashboard.js",
  family: "A",
  command: "dash",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dash",
  aliases: [],
  category: "misc",
  description: "New plugin: dash",
  usage: ".dash",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
