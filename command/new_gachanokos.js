const { run } = require('../lib/compat');
const META = {
  file: "prem-gachanokos.js",
  family: "A",
  command: "gachanokos",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "gachanokos",
  aliases: ["getotp", "getotp", "getotp"],
  category: "misc",
  description: "New plugin: gachanokos",
  usage: ".gachanokos",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
