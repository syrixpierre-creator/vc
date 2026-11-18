const { run } = require('../lib/compat');
const META = {
  file: "prem-amprem.js",
  family: "A",
  command: "ampremium",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ampremium",
  aliases: [],
  category: "misc",
  description: "New plugin: ampremium",
  usage: ".ampremium",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
