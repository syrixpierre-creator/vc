const { run } = require('../lib/compat');
const META = {
  file: "dashlive.js",
  family: "A",
  command: "dashlive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "dashlive",
  aliases: ["dashboardlive", "statusbotlive"],
  category: "misc",
  description: "New plugin: dashlive",
  usage: ".dashlive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
