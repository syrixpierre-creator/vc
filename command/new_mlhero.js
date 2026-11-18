const { run } = require('../lib/compat');
const META = {
  file: "internet-heroml.js",
  family: "A",
  command: "mlhero",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "mlhero",
  aliases: [],
  category: "misc",
  description: "New plugin: mlhero",
  usage: ".mlhero",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
