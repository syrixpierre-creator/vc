const { run } = require('../lib/compat');
const META = {
  file: "search-bingimage.js",
  family: "A",
  command: "bingimage",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "bingimage",
  aliases: [],
  category: "misc",
  description: "New plugin: bingimage",
  usage: ".bingimage",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
