const { run } = require('../lib/compat');
const META = {
  file: "hitamkan.js",
  family: "A",
  command: "penghitaman",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "penghitaman",
  aliases: ["hytam", "hitamkan", "hitam"],
  category: "misc",
  description: "New plugin: penghitaman",
  usage: ".penghitaman",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
