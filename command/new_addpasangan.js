const { run } = require('../lib/compat');
const META = {
  file: "addpasangan.js",
  family: "A",
  command: "addpasangan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "addpasangan",
  aliases: [],
  category: "misc",
  description: "New plugin: addpasangan",
  usage: ".addpasangan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
