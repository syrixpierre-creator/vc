const { run } = require('../lib/compat');
const META = {
  file: "tools-togif.js",
  family: "A",
  command: "webp2mp4",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "webp2mp4",
  aliases: [],
  category: "misc",
  description: "New plugin: webp2mp4",
  usage: ".webp2mp4",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
