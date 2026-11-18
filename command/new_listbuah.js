const { run } = require('../lib/compat');
const META = {
  file: "rpg-buah.js",
  family: "A",
  command: "listbuah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "listbuah",
  aliases: [],
  category: "misc",
  description: "New plugin: listbuah",
  usage: ".listbuah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
