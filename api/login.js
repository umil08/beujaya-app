// POST /api/login — verifies credentials server-side against env vars,
// then sets a signed HttpOnly session cookie. The password never leaves the server.
const { sign, configured } = require('./_auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });
  if (!configured()) {
    return res.status(503).json({ ok: false, error: 'Server not configured — set BEUJAYA_USER and BEUJAYA_PASS env vars in Vercel.' });
  }

  let b = req.body;
  if (typeof b === 'string') {
    const p = new URLSearchParams(b);
    b = { username: p.get('username'), password: p.get('password') };
  }
  b = b || {};

  const u = (b.username || '').trim();
  const p = b.password || '';

  if (u === process.env.BEUJAYA_USER && p === process.env.BEUJAYA_PASS) {
    const token = sign({ u, exp: Date.now() + 86400000 });
    res.setHeader('Set-Cookie', `bjsession=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400; Secure`);
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false });
};
