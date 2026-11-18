const { run } = require('../lib/compat');
const META = {
  file: "bypass2.js",
  family: "A",
  command: "bypass2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "bypass2",
  aliases: ["bypasslink2"],
  category: "misc",
  description: "New plugin: bypass2",
  usage: ".bypass2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
