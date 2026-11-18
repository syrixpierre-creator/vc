const { run } = require('../lib/compat');
const META = {
  file: "fonts-cmds.js",
  family: "B",
  command: "fontfontnumber",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fontfontnumber",
  aliases: ["font"],
  category: "misc",
  description: "New plugin: fontfontnumber",
  usage: ".fontfontnumber",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
