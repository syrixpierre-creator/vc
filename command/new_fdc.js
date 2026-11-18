const { run } = require('../lib/compat');
const META = {
  file: "maker-fakediscoard.js",
  family: "A",
  command: "fdc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fdc",
  aliases: ["fakediscoard"],
  category: "misc",
  description: "New plugin: fdc",
  usage: ".fdc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
