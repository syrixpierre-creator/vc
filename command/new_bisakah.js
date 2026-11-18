const { run } = require('../lib/compat');
const META = {
  file: "fun-bisakah.js",
  family: "A",
  command: "bisakah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "bisakah",
  aliases: [],
  category: "misc",
  description: "New plugin: bisakah",
  usage: ".bisakah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
