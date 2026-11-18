const { run } = require('../lib/compat');
const META = {
  file: "maker-fakedana.js",
  family: "A",
  command: "fakedana",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "fakedana",
  aliases: ["fakedan"],
  category: "misc",
  description: "New plugin: fakedana",
  usage: ".fakedana",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
