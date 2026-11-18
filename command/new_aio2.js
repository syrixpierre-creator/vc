const { run } = require('../lib/compat');
const META = {
  file: "downloader-aio2.js",
  family: "A",
  command: "aio2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "aio2",
  aliases: [],
  category: "misc",
  description: "New plugin: aio2",
  usage: ".aio2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
