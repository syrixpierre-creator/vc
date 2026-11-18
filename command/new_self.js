const { run } = require('../lib/compat');
const META = {
  file: "self-public.js",
  family: "A",
  command: "self",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "self",
  aliases: ["public"],
  category: "misc",
  description: "New plugin: self",
  usage: ".self",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
