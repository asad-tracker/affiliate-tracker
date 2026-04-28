const { verifyCredentials, generateToken, COOKIE_NAME } = require('../services/authService');

const COOKIE_OPTIONS = {
  httpOnly: true,       // JS cannot read it — XSS protection
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const valid = await verifyCredentials(username, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(username);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ ok: true, redirect: '/dashboard' });

  } catch (err) { next(err); }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME);
  res.redirect('/login');
}

function me(req, res) {
  res.json({ username: req.user.username });
}

module.exports = { login, logout, me };