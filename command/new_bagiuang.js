const { run } = require('../lib/compat');
const META = {
  file: "rpg-bagiuang.js",
  family: "A",
  command: "bagiuang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "bagiuang",
  aliases: [],
  category: "misc",
  description: "New plugin: bagiuang",
  usage: ".bagiuang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
