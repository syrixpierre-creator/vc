const { run } = require('../lib/compat');
const META = {
  file: "owner-setlabel.js",
  family: "A",
  command: "setlabel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "setlabel",
  aliases: ["label"],
  category: "misc",
  description: "New plugin: setlabel",
  usage: ".setlabel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
