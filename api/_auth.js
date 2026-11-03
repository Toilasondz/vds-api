// api/_auth.js — Admin authentication middleware
// Credentials: hson / Son2012@

const ADMIN_USERS = {
  'hson': 'Son2012@'
};

export function checkAdminAuth(req) {
  // Check Basic Auth header
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf8');
    const [user, pass] = decoded.split(':');
    if (ADMIN_USERS[user] && ADMIN_USERS[user] === pass) {
      return true;
    }
  }

  // Check session cookie
  const cookieHeader = req.headers['cookie'] || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';')
      .map(c => c.trim().split('='))
      .filter(p => p.length === 2)
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );

  if (cookies['vs_session']) {
    try {
      const session = JSON.parse(
        Buffer.from(cookies['vs_session'], 'base64').toString('utf8')
      );
      if (ADMIN_USERS[session.user] && session.expires > Date.now()) {
        return true;
      }
    } catch (_) {}
  }

  return false;
}

export function createSessionCookie(username) {
  const session = { user: username, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  const value = Buffer.from(JSON.stringify(session)).toString('base64');
  return `vs_session=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function validateLogin(username, password) {
  return ADMIN_USERS[username] && ADMIN_USERS[username] === password;
}
