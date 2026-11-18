const { run } = require('../lib/compat');
const META = {
  file: "sewa-join.js",
  family: "A",
  command: "sewa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "sewa",
  aliases: ["addsewa"],
  category: "misc",
  description: "New plugin: sewa",
  usage: ".sewa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
