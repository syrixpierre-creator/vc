const { run } = require('../lib/compat');
const META = {
  file: "runcrm.js",
  family: "A",
  command: "runcrm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "runcrm",
  aliases: [],
  category: "misc",
  description: "New plugin: runcrm",
  usage: ".runcrm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
