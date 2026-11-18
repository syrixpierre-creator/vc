const { run } = require('../lib/compat');
const META = {
  file: "owner-fakemsg.js",
  family: "A",
  command: "fakemsg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fakemsg",
  aliases: [],
  category: "misc",
  description: "New plugin: fakemsg",
  usage: ".fakemsg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
