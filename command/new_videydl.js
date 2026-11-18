const { run } = require('../lib/compat');
const META = {
  file: "downloader-videy2.js",
  family: "A",
  command: "videydl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "videydl",
  aliases: [],
  category: "misc",
  description: "New plugin: videydl",
  usage: ".videydl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
