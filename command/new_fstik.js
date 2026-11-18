const { run } = require('../lib/compat');
const META = {
  file: "sticker-fstik.js",
  family: "A",
  command: "fstik",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fstik",
  aliases: ["stickerinfo"],
  category: "misc",
  description: "New plugin: fstik",
  usage: ".fstik",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
