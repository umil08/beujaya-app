// Shared auth helpers. Underscore prefix → not exposed as an API route.
// Signing key is DERIVED from the env credentials, so nothing secret lives in source.
const crypto = require('crypto');

function key() {
  return crypto.createHash('sha256')
    .update('bj:' + (process.env.BEUJAYA_USER || '') + ':' + (process.env.BEUJAYA_PASS || ''))
    .digest();
}

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', key()).update(data).digest('base64url');
  return data + '.' + mac;
}

function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const i = token.indexOf('.');
  if (i < 0) return null;
  const data = token.slice(0, i);
  const mac = token.slice(i + 1);
  const expected = crypto.createHmac('sha256', key()).update(data).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch (e) {
    return null;
  }
}

function cookie(req, name) {
  const h = (req.headers && req.headers.cookie) || '';
  for (const part of h.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1 && part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

function configured() {
  return !!(process.env.BEUJAYA_USER && process.env.BEUJAYA_PASS);
}

module.exports = { sign, verify, cookie, configured };
