/*****************************************************************************
 * QUEEN AKUMA — Fake contact quote (vCard) for styled replies
 *****************************************************************************/
'use strict';

const settings = require('../settings');

const DEFAULTS = {
  FALLBACK_NUM: '554488138425',
  PUSH_NAME: 'DEX',
  PARTICIPANT: '0@s.whatsapp.net',
  REMOTE_JID: 'status@broadcast',
  DISPLAY_NAME: '© MADE BY MR SHYAM',
  ORG: 'META AI',
  FN: 'Meta'
};

function normalizeNumber(input, fallback = DEFAULTS.FALLBACK_NUM) {
  const digits = String(input ?? '').replace(/\D/g, '');
  return digits.length >= 8 ? digits : fallback;
}

function sanitizeField(value) {
  return String(value ?? '').replace(/[\r\n;:,]/g, ' ').trim();
}

const OWNER_NUM = normalizeNumber(settings?.ownerNumber);

function buildFakeVCard(opts = {}) {
  const waid = normalizeNumber(opts.waid, OWNER_NUM);
  const displayName = sanitizeField(opts.displayName ?? DEFAULTS.DISPLAY_NAME);
  const org = sanitizeField(opts.org ?? DEFAULTS.ORG);
  const pushName = sanitizeField(opts.pushName ?? DEFAULTS.PUSH_NAME);
  const participant = opts.participant ?? `${waid}@s.whatsapp.net`;
  const remoteJid = opts.remoteJid ?? DEFAULTS.REMOTE_JID;

  const vcardString = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${sanitizeField(opts.fn ?? DEFAULTS.FN)}`,
    `ORG:${org};`,
    `TEL;type=CELL;type=VOICE;waid=${waid}:+${waid}`,
    'END:VCARD'
  ].join('\n');

  return Object.freeze({
    key: Object.freeze({
      fromMe: false,
      participant: participant,
      remoteJid: remoteJid
    }),
    pushName: pushName,
    message: Object.freeze({
      contactMessage: Object.freeze({
        displayName: displayName,
        vcard: vcardString
      })
    })
  });
}

const fakevCard = buildFakeVCard();

module.exports = {
  fakevCard,
  buildFakeVCard,
  normalizeNumber
};
