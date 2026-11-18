const { run } = require('../lib/compat');
const META = {
  file: "ai-3d.js",
  family: "A",
  command: "ai3d",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "ai3d",
  aliases: [],
  category: "misc",
  description: "New plugin: ai3d",
  usage: ".ai3d",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
