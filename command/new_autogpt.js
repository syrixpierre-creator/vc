const { run } = require('../lib/compat');
const META = {
  file: "group-autogpt.js",
  family: "A",
  command: "autogpt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "autogpt",
  aliases: [],
  category: "misc",
  description: "New plugin: autogpt",
  usage: ".autogpt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
