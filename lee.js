/** QUEEN AKUMA • `lee` registrar shim (same family as sam.js / command.js).
 * Files written for the 'lee' framework register here; QUEEN AKUMA's loader
 * skips them by design (they are not { command, handler } plugins),
 * but requiring them no longer crashes with 'Cannot find module ../lee'. */
const { registrar } = require('./lib/compat');
function lee(info, fn) { return registrar(info, fn); }
lee.cmd = lee;
lee.commands = [];
module.exports = { lee };
module.exports.lee = lee;
