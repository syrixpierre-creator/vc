// QUEEN AKUMA v3.5.0 • lib/automute.js (raganork automute/autounmute se — clean reimplementation)
// Time par group auto mute/unmute: mute = sirf admins bhej sakte hain
// (groupSettingUpdate 'announcement'), unmute = 'not_announcement'.
// Store: data/automute.json { chatId: { muteH, muteM, unmuteH, unmuteM, muted } }.
// checkDue(sock) — lib/scheduler.js tick (har 30s) se call hota hai.
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'automute.json');

function load() { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch (_) { return {}; } }
function save(d) { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(d, null, 2)); } catch (_) {} }

function parseHM(args) {
  const nums = (args || []).join(' ').match(/\d+/g) || [];
  if (nums.length < 2) return null;
  const h = parseInt(nums[0], 10); const m = parseInt(nums[1], 10);
  if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return null;
  return { h, m };
}
function fmt(h, m) { return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }

function inMuteWindow(nowMin, muteMin, unmuteMin) {
  if (muteMin === unmuteMin) return false;
  if (muteMin < unmuteMin) return nowMin >= muteMin && nowMin < unmuteMin;
  return nowMin >= muteMin || nowMin < unmuteMin; // overnight window
}

async function checkDue(sock) {
  if (!sock) return;
  const cfg = load();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let changed = false;
  for (const [chatId, c] of Object.entries(cfg)) {
    if (c.muteH === undefined || c.unmuteH === undefined) continue;
    const shouldMute = inMuteWindow(nowMin, c.muteH * 60 + c.muteM, c.unmuteH * 60 + c.unmuteM);
    if (shouldMute && !c.muted) {
      try { await sock.groupSettingUpdate(chatId, 'announcement'); c.muted = true; changed = true; } catch (_) {}
    } else if (!shouldMute && c.muted) {
      try { await sock.groupSettingUpdate(chatId, 'not_announcement'); c.muted = false; changed = true; } catch (_) {}
    }
  }
  if (changed) save(cfg);
}

module.exports = { load, save, parseHM, fmt, checkDue, inMuteWindow };
