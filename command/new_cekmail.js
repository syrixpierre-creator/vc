const { run } = require('../lib/compat');
const META = {
  file: "tools-tempmail.js",
  family: "A",
  command: "cekmail",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "cekmail",
  aliases: ["pesanmail"],
  category: "misc",
  description: "New plugin: cekmail",
  usage: ".cekmail",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
