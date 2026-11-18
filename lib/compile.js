/**
 * QUEEN AKUMA • compile helper.
 * getBin(name) returns the path of a prebuilt helper binary in temp/bin.
 * No binaries ship in the repo, so callers get a clear error telling them
 * the binary is missing instead of 'getBin is not a function'.
 */
const fs = require('fs');
const path = require('path');
function getBin(name) {
  const bin = path.join(process.cwd(), 'temp', 'bin', String(name));
  if (!fs.existsSync(bin)) throw new Error('Helper binary not built: ' + bin + ' (put the compiled ' + name + ' binary there)');
  return bin;
}
async function compile() { return null; }
module.exports = { compile, getBin };
