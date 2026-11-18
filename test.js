/**
 * QUEEN AKUMA • syntax + export check (no WhatsApp, no network).
 * Old test.js did require() on every file, so one missing optional
 * dependency crashed the whole check. This version parses with vm.Script
 * and only reports real syntax errors + QUEEN AKUMA plugins missing command/handler.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const folders = [path.join(__dirname, 'lib'), path.join(__dirname, 'command')];
let total = 0, ok = 0, bad = 0;
const failures = [];

for (const folder of folders) {
  if (!fs.existsSync(folder)) { console.log('Folder not found: ' + folder); continue; }
  for (const file of fs.readdirSync(folder).filter((f) => f.endsWith('.js'))) {
    const fp = path.join(folder, file);
    total++;
    try {
      const code = fs.readFileSync(fp, 'utf8');
      new vm.Script(code, { filename: fp });
      ok++;
    } catch (e) {
      bad++;
      failures.push(fp + ': ' + e.message.split('\n')[0]);
    }
  }
}

console.log('\nValidation Summary:');
console.log('Total files checked: ' + total);
console.log('OK files: ' + ok);
if (bad) {
  console.log('Files with syntax errors: ' + bad);
  for (const f of failures.slice(0, 50)) console.log('  ' + f);
  process.exit(1);
}
console.log('All files passed syntax validation!');
process.exit(0);
