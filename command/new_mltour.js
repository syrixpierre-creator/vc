const { run } = require('../lib/compat');
const META = {
  file: "internet-mltour.js",
  family: "A",
  command: "mltour",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "mltour",
  aliases: [],
  category: "misc",
  description: "New plugin: mltour",
  usage: ".mltour",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
