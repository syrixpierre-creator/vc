const fs = require('fs');
const os = require('os');
const path = require('path');
const DIR = path.join(process.cwd(), 'tmp');
module.exports = {
  getTempDir() {
    try {
      fs.mkdirSync(DIR, {
        recursive: true
      });
      return DIR;
    } catch (_) {
      return os.tmpdir();
    }
  },
  deleteTempFile(p) {
    try {
      if (p && fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    } catch (_) {}
  }
};
