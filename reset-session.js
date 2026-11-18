const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'session');
if (fs.existsSync(dir)) { fs.rmSync(dir, { recursive: true, force: true }); console.log('Session cleared. Run npm start and pair again.'); }
else console.log('No session folder found - nothing to clear.');
