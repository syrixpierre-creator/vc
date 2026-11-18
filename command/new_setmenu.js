const { run } = require('../lib/compat');
const META = {
  file: "owner-setmenu.js",
  family: "A",
  command: "setmenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "setmenu",
  aliases: [],
  category: "misc",
  description: "New plugin: setmenu",
  usage: ".setmenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
