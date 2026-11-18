const { run } = require('../lib/compat');
const META = {
  file: "sticker-stickerpack.js",
  family: "A",
  command: "stickerpack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "stickerpack",
  aliases: [],
  category: "misc",
  description: "New plugin: stickerpack",
  usage: ".stickerpack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
