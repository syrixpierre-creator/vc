const { run } = require('../lib/compat');
const META = {
  file: "rpg-skill.js",
  family: "A",
  command: "skill",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "skill",
  aliases: [],
  category: "misc",
  description: "New plugin: skill",
  usage: ".skill",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
