// GET /api/me — verifies the signed session cookie server-side.
// Gated pages call this on load and redirect to login if it returns 401.
const { verify, cookie } = require('./_auth');

module.exports = (req, res) => {
  const p = verify(cookie(req, 'bjsession'));
  if (p) return res.status(200).json({ ok: true, user: p.u });
  return res.status(401).json({ ok: false });
};
