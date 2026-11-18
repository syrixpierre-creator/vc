const { run } = require('../lib/compat');
const META = {
  file: "sound-cmds.js",
  family: "B",
  command: "soundi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "soundi",
  aliases: [],
  category: "misc",
  description: "New plugin: soundi",
  usage: ".soundi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
