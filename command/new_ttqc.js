const { run } = require('../lib/compat');
const META = {
  file: "maker-ttqc.js",
  family: "A",
  command: "ttqc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ttqc",
  aliases: [],
  category: "misc",
  description: "New plugin: ttqc",
  usage: ".ttqc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
