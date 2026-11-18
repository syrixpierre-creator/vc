/**
 * QUEEN AKUMA — runtime bot profile (name, menu image, menu video)
 */
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

const FILE = path.join(process.cwd(), 'data', 'bot-profile.json');

function load() {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf8')) || {};
  } catch {
    return {};
  }
}

function save(data) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  applyToSettings(data);
  return data;
}

function applyToSettings(data) {
  if (!data) data = load();
  if (data.botName) {
    settings.botName = data.botName;
    try { process.env.BOT_NAME = data.botName; } catch (_) {}
  }
  if (data.menuImage) {
    settings.menuImage = data.menuImage;
    try { process.env.MENU_IMAGE = data.menuImage; } catch (_) {}
  }
  if (data.menuVideo) {
    settings.menuVideo = data.menuVideo;
    try { process.env.MENU_VIDEO = data.menuVideo; } catch (_) {}
  }
  if (data.botOwner) settings.botOwner = data.botOwner;
}

// apply on require
applyToSettings(load());

function get() {
  const d = load();
  return {
    botName: d.botName || settings.botName || 'QUEEN AKUMA',
    menuImage: d.menuImage || settings.menuImage || '',
    menuVideo: d.menuVideo || settings.menuVideo || '',
    botOwner: d.botOwner || settings.botOwner || ''
  };
}

function setField(key, value) {
  const d = load();
  d[key] = value;
  save(d);
  return d;
}

module.exports = { load, save, get, setField, applyToSettings, FILE };
