const { run } = require('../lib/compat');
const META = {
  file: "Group-menuam.js",
  family: "A",
  command: "ammenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ammenu",
  aliases: [],
  category: "misc",
  description: "New plugin: ammenu",
  usage: ".ammenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
