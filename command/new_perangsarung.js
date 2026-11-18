const { run } = require('../lib/compat');
const META = {
  file: "game-perangsarung.js",
  family: "A",
  command: "perangsarung",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "perangsarung",
  aliases: [],
  category: "misc",
  description: "New plugin: perangsarung",
  usage: ".perangsarung",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
