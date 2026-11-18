/** QUEEN AKUMA — registrar `cmd({ pattern }, fn)` pour les plugins legacy.
 * Chaque appel est transmis au registrar de lib/compat (sinon la commande
 * n'était jamais trouvée et tombait sur le moteur de secours). */
const commands = [];
function cmd(info, func) {
  if (info && typeof info === 'object') {
    commands.push({ ...info, function: func });
    try { require('./lib/compat').registrar(info, func); } catch (_) {}
  }
  return { commands };
}
cmd.commands = commands;
module.exports = { cmd, commands, command: cmd, AddCommand: cmd, Command: cmd, bandah: cmd, malvin: cmd, smd: cmd };
