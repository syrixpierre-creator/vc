const { run } = require('../lib/compat');
const META = {
  file: "maker-fakeiosch.js",
  family: "A",
  command: "fakech",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fakech",
  aliases: ["fakechannel"],
  category: "misc",
  description: "New plugin: fakech",
  usage: ".fakech",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
