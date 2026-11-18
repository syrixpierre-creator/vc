const { run } = require('../lib/compat');
const META = {
  file: "group-addlist.js",
  family: "A",
  command: "addlist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "addlist",
  aliases: ["dellist"],
  category: "misc",
  description: "New plugin: addlist",
  usage: ".addlist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
