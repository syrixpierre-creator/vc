const { run } = require('../lib/compat');
const META = {
  file: "ai.js",
  family: "B",
  command: "blackhatai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "blackhatai",
  aliases: ["chatai", "gpt4o", "gpt4o-mini", "venice", "letmegpt"],
  category: "misc",
  description: "New plugin: blackhatai",
  usage: ".blackhatai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
