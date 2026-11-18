const { run } = require('../lib/compat');
const META = {
  file: "playch.js",
  family: "A",
  command: "playch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "playch",
  aliases: [],
  category: "misc",
  description: "New plugin: playch",
  usage: ".playch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
