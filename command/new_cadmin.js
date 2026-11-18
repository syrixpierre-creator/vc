const { run } = require('../lib/compat');
const META = {
  file: "panel-cadmin.js",
  family: "A",
  command: "cadmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "cadmin",
  aliases: [],
  category: "misc",
  description: "New plugin: cadmin",
  usage: ".cadmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
