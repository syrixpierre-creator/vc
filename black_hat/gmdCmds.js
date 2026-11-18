/** QUEEN AKUMA — registrar `gmd({ pattern, aliases }, async (from, Gifted, conText) => {})`
 * (format Gifted-Tech). Transmis à lib/compat avec __style:'gmd' pour que
 * le handler reçoive (from, sock, conText) et non (conn, mek, m, ctx). */
const commands = [];
function gmd(info, fn) {
  if (!info || typeof info !== 'object' || typeof fn !== 'function') return fn;
  const alias = info.alias || info.aliases || [];
  commands.push({ ...info, alias });
  try { require('../lib/compat').registrar({ ...info, alias, __style: 'gmd' }, fn); } catch (_) {}
  return fn;
}
gmd.cmd = gmd;
gmd.command = gmd;
module.exports = { gmd, commands };
