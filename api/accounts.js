// Gated CRUD for the account LIST (name / status / role), persisted in a KV store.
// Boundary: this endpoint intentionally NEVER accepts or stores a real FB session
// cookie/credential. The cookie column is a cosmetic masked placeholder generated here.
const { verify, cookie } = require('./_auth');
const store = require('./_store');

const KEY = 'beujaya:accounts';
const MAX = 100;
const SEED = [
  { id: 1, name: 'Geupap Official', status: 'active', role: 'default', cookie: 'c_user=100••••••; xs=39%3A••••' },
  { id: 2, name: 'Aceh Affiliate', status: 'active', role: 'member', cookie: 'c_user=100••••••; xs=2a%3A••••' },
  { id: 3, name: 'Promo Harian', status: 'active', role: 'member', cookie: 'c_user=100••••••; xs=7f%3A••••' },
  { id: 4, name: 'Toko Umil', status: 'inactive', role: 'member', cookie: 'expired' },
  { id: 5, name: 'Diskon Gila', status: 'inactive', role: 'member', cookie: '—' },
];

function authed(req) { return !!verify(cookie(req, 'bjsession')); }
function clean(s, max) { return String(s == null ? '' : s).trim().slice(0, max); }
function rnd() { return Math.floor(Math.random() * 256).toString(16).padStart(2, '0'); }

module.exports = async (req, res) => {
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'unauthorized' });
  if (!store.configured()) {
    return res.status(501).json({ ok: false, configured: false, error: 'Storage not configured — create a KV store in Vercel and redeploy.' });
  }

  try {
    let list = await store.getJSON(KEY);
    if (!Array.isArray(list)) { list = SEED.slice(); await store.setJSON(KEY, list); }

    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, accounts: list });
    }

    if (req.method === 'POST') {
      let b = req.body;
      if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
      b = b || {};

      if (b.op === 'add') {
        const name = clean(b.name, 60);
        if (!name) return res.status(400).json({ ok: false, error: 'name required' });
        if (list.length >= MAX) return res.status(400).json({ ok: false, error: 'limit reached' });
        const status = b.status === 'inactive' ? 'inactive' : 'active';
        const role = b.role === 'default' ? 'default' : 'member';
        if (role === 'default') list.forEach((x) => { x.role = 'member'; });
        const id = list.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
        // Cookie is a generated placeholder only — never a real session value.
        const masked = status === 'active' ? ('c_user=100••••••; xs=' + rnd() + '%3A••••') : '—';
        list.push({ id, name, status, role, cookie: masked });
      } else if (b.op === 'remove') {
        const id = Number(b.id);
        list = list.filter((x) => x.id !== id);
      } else if (b.op === 'setDefault') {
        const id = Number(b.id);
        list.forEach((x) => { x.role = (x.id === id ? 'default' : 'member'); });
      } else {
        return res.status(400).json({ ok: false, error: 'unknown op' });
      }

      await store.setJSON(KEY, list);
      return res.status(200).json({ ok: true, accounts: list });
    }

    return res.status(405).json({ ok: false, error: 'method' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String((e && e.message) || e) });
  }
};
