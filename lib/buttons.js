'use strict';
/** QUEEN AKUMA — old-style quick-reply buttons (same format as the old QUEEN AKUMA). */
const settings = require('../settings');

const prefix = () => (settings.prefixes && settings.prefixes[0]) || '.';
const FOOTER = 'QUEEN AKUMA';

/** [['menu','🗂️ Menu'], ...] -> buttons array. An id without a prefix is a command. */
function make(list) {
  const p = prefix();
  return list.slice(0, 3).map(([id, label]) => ({
    buttonId: /^[.!#/]/.test(id) || ['channel', 'support'].includes(id) ? id : p + id,
    buttonText: { displayText: label },
    type: 1,
  }));
}

/** Add buttons to a text message. */
function withButtons(content, list, footer = FOOTER) {
  return { ...content, buttons: make(list), headerType: 1, footer };
}

module.exports = { make, withButtons, FOOTER };
