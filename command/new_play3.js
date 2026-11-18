const { run } = require('../lib/compat');
const META = {
  file: "play3.js",
  family: "A",
  command: 'play3x',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "play3alt",
  aliases: [],
  category: "misc",
  description: "New plugin: play3",
  usage: ".play3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
