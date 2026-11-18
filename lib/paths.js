const path = require('path');
const fs = require('fs');

function dataDir() {
  const d = path.join(process.cwd(), 'data');
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

function dataFile(name) {
  return path.join(dataDir(), name);
}

module.exports = { dataDir, dataFile };
