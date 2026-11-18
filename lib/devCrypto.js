/**
 * QUEEN AKUMA v3.3.0 — TOTP (2FA) + AES encryption helpers (pure Node crypto, no deps)
 */
const crypto = require('crypto');

// ---- TOTP (RFC 6238, 30s step, 6 digits) ----
function base32Decode(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of String(str).toUpperCase().replace(/[^A-Z2-7]/g, '')) {
    bits += alphabet.indexOf(ch).toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function totp(secret, atMs = Date.now()) {
  const key = base32Decode(secret);
  const counter = Math.floor(atMs / 30000);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
  const remaining = 30 - Math.floor((atMs / 1000) % 30);
  return { code: String(code).padStart(6, '0'), remaining };
}
function randomSecret() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let s = '';
  for (let i = 0; i < 16; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

// ---- AES-256-CBC (key = SHA256 of master password) ----
function aesKey(master) { return crypto.createHash('sha256').update(String(master)).digest(); }
function aesEncrypt(plain, master) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey(master), iv);
  return iv.toString('hex') + ':' + Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]).toString('hex');
}
function aesDecrypt(enc, master) {
  const [ivHex, dataHex] = String(enc).split(':');
  if (!ivHex || !dataHex) throw new Error('bad format');
  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey(master), Buffer.from(ivHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}
function sha256(s) { return crypto.createHash('sha256').update(String(s)).digest('hex'); }

module.exports = { totp, randomSecret, aesEncrypt, aesDecrypt, sha256 };
