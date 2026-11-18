/** QUEEN AKUMA — registrar "lite" pour les plugins legacy.
 * `lite({ pattern, alias }, fn)` / `cmd(...)` → registrar de lib/compat. */
function reg(info, fn) {
  try { return require('./lib/compat').registrar(info, fn); } catch (_) { return fn; }
}
reg.cmd = reg;
reg.commands = [];
const settings = require('./settings');
module.exports = {
  lite: reg,
  cmd: reg,
  commands: [],
  config: { PREFIX: settings.prefixes[0], BOT_NAME: settings.botName, OWNER_NUMBER: settings.ownerNumber },
  prefix: settings.prefixes[0],
  get fakevCard() { try { return require('./lib/fakevCard').fakevCard; } catch (_) { return null; } },
};
