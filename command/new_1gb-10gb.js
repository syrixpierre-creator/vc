const { run } = require('../lib/compat');
const META = {
  file: "cpanel.js",
  family: "A",
  command: "1gb-10gb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "1gb-10gb",
  aliases: [],
  category: "misc",
  description: "New plugin: 1gb-10gb",
  usage: ".1gb-10gb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
