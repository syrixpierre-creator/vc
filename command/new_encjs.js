const { run } = require('../lib/compat');
const META = {
  file: "encjs.js",
  family: "A",
  command: "encjs",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "encjs",
  aliases: [],
  category: "misc",
  description: "New plugin: encjs",
  usage: ".encjs",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
