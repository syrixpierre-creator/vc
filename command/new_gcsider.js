const { run } = require('../lib/compat');
const META = {
  file: "group-sider.js",
  family: "A",
  command: "gcsider",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "gcsider",
  aliases: [],
  category: "misc",
  description: "New plugin: gcsider",
  usage: ".gcsider",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
