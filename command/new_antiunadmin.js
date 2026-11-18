const { run } = require('../lib/compat');
const META = {
  file: "group-antiunadmin.js",
  family: "A",
  command: "antiunadmin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antiunadmin",
  aliases: [],
  category: "misc",
  description: "New plugin: antiunadmin",
  usage: ".antiunadmin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
