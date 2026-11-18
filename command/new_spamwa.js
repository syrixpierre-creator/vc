const { run } = require('../lib/compat');
const META = {
  file: "tool-spamwa.js",
  family: "A",
  command: "spamwa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "spamwa",
  aliases: [],
  category: "misc",
  description: "New plugin: spamwa",
  usage: ".spamwa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
