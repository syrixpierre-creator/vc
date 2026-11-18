const { run } = require('../lib/compat');
const META = {
  file: "upscale-cmds.js",
  family: "B",
  command: "upscalei",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "upscalei",
  aliases: ["enhanceres"],
  category: "misc",
  description: "New plugin: upscalei",
  usage: ".upscalei",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
