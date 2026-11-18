const { run } = require('../lib/compat');
const META = {
  file: "internet-cuaca.js",
  family: "A",
  command: "cuaca",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "cuaca",
  aliases: [],
  category: "misc",
  description: "New plugin: cuaca",
  usage: ".cuaca",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
