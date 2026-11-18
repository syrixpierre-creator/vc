const { run } = require('../lib/compat');
const META = {
  file: "group-antitagsw.js",
  family: "A",
  command: "antitagsw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "antitagsw",
  aliases: [],
  category: "misc",
  description: "New plugin: antitagsw",
  usage: ".antitagsw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
