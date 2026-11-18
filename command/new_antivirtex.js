const { run } = require('../lib/compat');
const META = {
  file: "group-antivirtex.js",
  family: "A",
  command: "antivirtex",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antivirtex",
  aliases: [],
  category: "misc",
  description: "New plugin: antivirtex",
  usage: ".antivirtex",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
