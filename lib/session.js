const path = require('path');
const fs = require('fs');

/**
 * Restore WhatsApp credentials into ./session/creds.json
 *
 * Accepted SESSION_ID formats (anything before the last "~" is a label):
 *   QUEEN-AKUMA~<base64 creds.json>
 *   INCONNU-BOY-SENSEI~<base64 creds.json>          (DEX pair site)
 *   Dex-Bot-md~<base64 creds.json>         (DEX-BOT-MD pair site)
 *   DEX-<anything>~<base64 | mega file id> (any DEX- prefix)
 *   INCONNU-BOY-SENSEI~<fileId#key>                 (DEX QR site, stored on mega.nz)
 *   <raw base64>  or  <raw creds.json text>
 */
const KNOWN_LABEL = /^(QUEEN-AKUMA|QUEEN AKUMA|QUEEN|DEX|Dex|dex)[A-Za-z0-9_\-\/ ]*$/;

function stripLabel(txt) {
    let s = String(txt || '').trim().replace(/^["']|["']$/g, '');
    const i = s.lastIndexOf('~');
    if (i !== -1) {
        const label = s.slice(0, i);
        // accept DEX-/QUEEN-AKUMA labels, and also any other short label
        if (KNOWN_LABEL.test(label) || label.length <= 40) s = s.slice(i + 1);
    } else {
        s = s.replace(/^(QUEEN-AKUMA|DEX-[A-Za-z0-9_-]+|Dex-Bot-md)[_:\-]/i, '');
    }
    return s.trim();
}

function tryBase64Json(s) {
    try {
        const json = Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        const obj = JSON.parse(json);
        if (obj && typeof obj === 'object' && (obj.noiseKey || obj.signedIdentityKey || obj.me || obj.registrationId !== undefined)) return json;
    } catch {}
    return null;
}

async function fromMega(idKey) {
    const mega = require('megajs');
    const file = mega.File.fromURL(`https://mega.nz/file/${idKey}`);
    return await new Promise((resolve, reject) => {
        file.download((err, data) => (err ? reject(err) : resolve(data.toString('utf8'))));
    });
}

async function SaveCreds(txt) {
    const sessionDir = path.join(__dirname, '..', 'session');
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const raw = stripLabel(txt);
    if (!raw) throw new Error('SESSION_ID is empty');

    let json = null;

    if (raw.startsWith('{')) {                       // raw creds.json text
        try { JSON.parse(raw); json = raw; } catch {}
    }
    if (!json) json = tryBase64Json(raw);           // base64 creds.json

    if (!json && /^[A-Za-z0-9_-]{6,}#[A-Za-z0-9_-]{20,}$/.test(raw)) {   // mega.nz "id#key"
        const data = await fromMega(raw);
        try { JSON.parse(data); json = data; } catch {}
        if (!json) json = tryBase64Json(data.trim());
    }

    if (!json) {
        throw new Error('SESSION_ID invalid. Use INCONNU-BOY-SENSEI~<id> / Dex-Bot-md~<base64> / QUEEN-AKUMA~<base64>');
    }
    fs.writeFileSync(path.join(sessionDir, 'creds.json'), json);
}

module.exports = SaveCreds;
module.exports.stripLabel = stripLabel;
