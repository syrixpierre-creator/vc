const { run } = require('../lib/compat');
const META = {
  file: "store-payment.js",
  family: "A",
  command: "pay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};
module.exports = {
  command: "pay",
  aliases: ["addpay", "delpay", "listpay"],
  category: "misc",
  description: "New plugin: pay",
  usage: ".pay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
