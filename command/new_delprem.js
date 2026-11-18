const { run } = require('../lib/compat');
const META = {
  file: "owner-delprem.js",
  family: "A",
  command: "delprem",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "delprem",
  aliases: [],
  category: "misc",
  description: "New plugin: delprem",
  usage: ".delprem",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
