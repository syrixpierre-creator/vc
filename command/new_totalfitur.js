const { run } = require('../lib/compat');
const META = {
  file: "info-totalfitur.js",
  family: "A",
  command: "totalfitur",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "totalfitur",
  aliases: [],
  category: "misc",
  description: "New plugin: totalfitur",
  usage: ".totalfitur",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
