const { run } = require('../lib/compat');
const META = {
  file: "ai-text2img.js",
  family: "A",
  command: "text2img",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "text2img",
  aliases: [],
  category: "misc",
  description: "New plugin: text2img",
  usage: ".text2img",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
