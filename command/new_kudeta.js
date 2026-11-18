const { run } = require('../lib/compat');
const META = {
  file: "kudetagc.js",
  family: "A",
  command: "kudeta",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "kudeta",
  aliases: ["kudetagc"],
  category: "misc",
  description: "New plugin: kudeta",
  usage: ".kudeta",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
