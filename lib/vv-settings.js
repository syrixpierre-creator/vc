/*****************************************************************************
 * QUEEN AKUMA — ViewOnce / Auto-Detect VV settings (per chat)
 * Stored in data/database.json
 *****************************************************************************/
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.json');
const cwdDb = path.join(process.cwd(), 'data', 'database.json');

function ensureDir() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readDatabase() {
  try {
    ensureDir();
    if (!fs.existsSync(dbPath)) return {};
    const parsed = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('[vv-settings] read:', error.message);
    return {};
  }
}

function writeDatabase(database) {
  try {
    ensureDir();
    const json = JSON.stringify(database, null, 2);
    const tempPath = `${dbPath}.tmp`;
    fs.writeFileSync(tempPath, json);
    fs.renameSync(tempPath, dbPath);
    try {
      const d = path.dirname(cwdDb);
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      if (path.resolve(cwdDb) !== path.resolve(dbPath)) {
        fs.writeFileSync(cwdDb, json);
      }
    } catch (_) {}
  } catch (error) {
    console.error('[vv-settings] write:', error.message);
  }
}

function getViewOnceMode(chatId) {
  const database = readDatabase();
  return database.vv && database.vv[chatId] ? database.vv[chatId] : null;
}

function setViewOnceMode(chatId, mode) {
  const database = readDatabase();
  database.vv = database.vv || {};
  if (mode === null) delete database.vv[chatId];
  else database.vv[chatId] = mode;
  writeDatabase(database);
  return mode;
}

function getAutoDetectMode(chatId) {
  const database = readDatabase();
  if (!database.autoDetectVv) return null;
  // exact chat first, then global *
  if (database.autoDetectVv[chatId]) return database.autoDetectVv[chatId];
  if (chatId !== "*" && database.autoDetectVv["*"]) return database.autoDetectVv["*"];
  return null;
}

function setAutoDetectMode(chatId, mode) {
  const database = readDatabase();
  database.autoDetectVv = database.autoDetectVv || {};
  if (mode === null) delete database.autoDetectVv[chatId];
  else database.autoDetectVv[chatId] = mode;
  writeDatabase(database);
  return mode;
}

module.exports = {
  getViewOnceMode,
  setViewOnceMode,
  getAutoDetectMode,
  setAutoDetectMode
};
