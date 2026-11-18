const { run } = require('../lib/compat');
const META = {
  file: "notifberita.js",
  family: "A",
  command: "notifberita",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "notifberita",
  aliases: ["setberita", "intervalberita"],
  category: "misc",
  description: "New plugin: notifberita",
  usage: ".notifberita",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
