// GET /api/logout — clears the session cookie and returns to the login page.
module.exports = (req, res) => {
  res.setHeader('Set-Cookie', 'bjsession=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
  res.statusCode = 302;
  res.setHeader('Location', '/');
  res.end();
};
