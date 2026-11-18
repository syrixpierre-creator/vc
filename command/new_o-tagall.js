const { run } = require('../lib/compat');
const META = {
  file: "owner-tagall.js",
  family: "A",
  command: "o-tagall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "o-tagall",
  aliases: [],
  category: "misc",
  description: "New plugin: o-tagall",
  usage: ".o-tagall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
