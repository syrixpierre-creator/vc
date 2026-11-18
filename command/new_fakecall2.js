const { run } = require('../lib/compat');
const META = {
  file: "maker-fakecallandro.js",
  family: "A",
  command: "fakecall2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fakecall2",
  aliases: ["fakecal"],
  category: "misc",
  description: "New plugin: fakecall2",
  usage: ".fakecall2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
