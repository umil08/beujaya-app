// Minimal persistent KV via Upstash REST (works with Vercel KV / Upstash Marketplace).
// No SDK dependency — talks to the REST endpoint directly with fetch.
// Reads whichever env vars your provider injected.
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

function configured() {
  return !!(URL && TOKEN);
}

async function cmd(args) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error('store error ' + r.status);
  const j = await r.json();
  return j.result;
}

async function getJSON(key) {
  const v = await cmd(['GET', key]);
  if (v == null) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}

async function setJSON(key, value) {
  return cmd(['SET', key, JSON.stringify(value)]);
}

module.exports = { configured, getJSON, setJSON };
