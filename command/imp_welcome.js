/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for welcome.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "welcome.js",
  family: "A",
  command: 'welcomex',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "welcomealt",
  aliases: [],
  category: "restored",
  description: "Restored: welcome",
  usage: ".welcome",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
