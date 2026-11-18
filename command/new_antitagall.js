const { run } = require('../lib/compat');
const META = {
  file: "group-antitagall.js",
  family: "A",
  command: "antitagall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antitagall",
  aliases: [],
  category: "misc",
  description: "New plugin: antitagall",
  usage: ".antitagall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
