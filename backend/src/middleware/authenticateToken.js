const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type === 'refresh') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };

    return next();
  } catch (_err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateToken;
