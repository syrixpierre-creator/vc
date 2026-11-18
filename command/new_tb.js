const { run } = require('../lib/compat');
const META = {
  file: "downloader-terabox.js",
  family: "A",
  command: "tb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "tb",
  aliases: ["teradl"],
  category: "misc",
  description: "New plugin: tb",
  usage: ".tb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
