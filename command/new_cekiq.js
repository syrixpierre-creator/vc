const { run } = require('../lib/compat');
const META = {
  file: "fun-cekiq.js",
  family: "A",
  command: "cekiq",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "cekiq",
  aliases: [],
  category: "misc",
  description: "New plugin: cekiq",
  usage: ".cekiq",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
