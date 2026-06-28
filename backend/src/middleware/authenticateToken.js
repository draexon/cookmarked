const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { db } = require('../db/database');

const clerkAuth = ClerkExpressRequireAuth();

function syncUserMiddleware(req, res, next) {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const clerkId = req.auth.userId;
  
  let user = db.prepare('SELECT * FROM users WHERE clerk_id = ?').get(clerkId);
  
  if (!user) {
    const result = db.prepare('INSERT INTO users (clerk_id, name) VALUES (?, ?)').run(clerkId, 'User');
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }

  req.user = {
    id: user.id,
    clerk_id: user.clerk_id,
  };

  next();
}

module.exports = [clerkAuth, syncUserMiddleware];
