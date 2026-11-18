const { run } = require('../lib/compat');
const META = {
  file: "panel-listpanel.js",
  family: "A",
  command: "listp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "listp",
  aliases: ["listserver"],
  category: "misc",
  description: "New plugin: listp",
  usage: ".listp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
