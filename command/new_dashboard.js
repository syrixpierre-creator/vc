const { run } = require('../lib/compat');
const META = {
  file: "info-dash.js",
  family: "A",
  command: "dashboard",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dashboard",
  aliases: [],
  category: "misc",
  description: "New plugin: dashboard",
  usage: ".dashboard",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
