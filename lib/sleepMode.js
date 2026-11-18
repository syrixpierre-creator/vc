'use strict';
/**
 * QUEEN AKUMA v3.6.0 — Sleep mode state.
 * File: data/sleepmode.json — { enabled, since, by }
 * File na ho = awake. Gate: lib/messageHandler.js handleMessages me
 * (command dispatch se pehle) — sleep me non-owner ke commands chup-chap
 * ignore hote hain; hooks/storage/antidelete recovery chalte rehte hain.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/sleepmode.json');

function getState() {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return { enabled: !!j.enabled, since: j.since || null, by: j.by || null };
  } catch (_) {
    return { enabled: false, since: null, by: null };
  }
}

function setState(enabled, by) {
  const st = { enabled: !!enabled, since: enabled ? Date.now() : null, by: by || null };
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(st, null, 2));
  } catch (_) {}
  return st;
}

function isSleeping() {
  return getState().enabled;
}

module.exports = { getState, setState, isSleeping };
