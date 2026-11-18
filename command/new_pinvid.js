const { run } = require('../lib/compat');
const META = {
  file: "search-pinvideo.js",
  family: "A",
  command: "pinvid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "pinvid",
  aliases: [],
  category: "misc",
  description: "New plugin: pinvid",
  usage: ".pinvid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
